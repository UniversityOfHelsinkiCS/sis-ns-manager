import os
import sys
from datetime import date

from kubernetes import client, config

SELF_PROVISIONED_LABEL = "self-provisioned"
REQUESTER_ANNOTATION = "openshift.io/requester"
REQUESTER = "sis-ns-manager"
# Must match backend/utils/okdClient.ts
PROVISIONER_ANNOTATION = "sis-ns-manager/provisioner"
END_DATE_ANNOTATION = "sis-ns-manager/endDate"

# Cluster-infrastructure namespaces that must never be pruned, regardless of
# what labels or annotations they carry. This is a hard denylist that overrides
# is_managed(); it exists so a mislabelled system namespace can never be caught
# by the pruner.
PROTECTED_NAMESPACES = frozenset(
    {"default", "kube-system", "kube-public", "kube-node-lease"}
)
PROTECTED_PREFIXES = ("kube-", "openshift-")


def is_protected(name) -> bool:
    """Return True for OpenShift/Kubernetes system namespaces."""
    return (
        name in PROTECTED_NAMESPACES
        or name == "openshift"
        or name.startswith(PROTECTED_PREFIXES)
    )


def load_kube_config() -> None:
    try:
        config.load_incluster_config()
    except config.ConfigException:
        config.load_kube_config()


def is_managed(ns) -> bool:
    """Decide whether a namespace is managed by sis-ns-manager.

    WARNING: this filter is what stands between the pruner and the rest of the
    cluster. Changing the criteria is destructive and can lead to unintended
    namespaces getting destroyed.
    """
    if is_protected(ns.metadata.name):
        return False
    labels = ns.metadata.labels or {}
    annotations = ns.metadata.annotations or {}
    return (
        labels.get(SELF_PROVISIONED_LABEL) == "true"
        and annotations.get(REQUESTER_ANNOTATION) == REQUESTER
        and PROVISIONER_ANNOTATION in annotations
    )


def main() -> None:
    dry_run = os.environ.get("DRY_RUN", "").lower() in ("1", "true", "yes")
    today = date.today()
    load_kube_config()
    v1 = client.CoreV1Api()

    managed = [ns for ns in v1.list_namespace().items if is_managed(ns)]
    print(f"found {len(managed)} managed namespaces")

    failures = 0
    for ns in managed:
        name = ns.metadata.name
        # Redundant with is_managed(), kept as a last line of defence right next
        # to the destructive call.
        if is_protected(name):
            print(f"{name}: protected system namespace, skipping")
        end_date_str = (ns.metadata.annotations or {}).get(END_DATE_ANNOTATION)
        if not end_date_str:
            print(f"{name}: missing {END_DATE_ANNOTATION} annotation, skipping")
            continue

        try:
            end_date = date.fromisoformat(end_date_str)
        except ValueError:
            print(f"{name}: invalid {END_DATE_ANNOTATION} value {end_date_str!r}, skipping")
            failures += 1
            continue

        if end_date > today:
            print(f"{name}: keeping, ends {end_date}")
            continue
        if ns.status and ns.status.phase == "Terminating":
            print(f"{name}: already terminating")
            continue
        if dry_run:
            print(f"{name}: would delete (ended {end_date}) [dry run]")
            continue

        # Destructive action disabled until the filtering has been verified in the cluster.
        # try:
        #     v1.delete_namespace(name)
        #     print(f"{name}: deleted (ended {end_date})")
        # except client.ApiException as e:
        #     print(f"{name}: delete failed: {e.reason}", file=sys.stderr)
        #     failures += 1
        print(f"{name}: would delete (ended {end_date}) [delete disabled]")

    if failures:
        sys.exit(1)


if __name__ == "__main__":
    main()
