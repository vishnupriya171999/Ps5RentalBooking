export default function ManagerTableSkeleton() {
  return <>{Array.from({ length: 6 }, (_, index) => <tr key={index} className="manager-skeleton-row" aria-hidden="true">
    <td><div className="manager-person"><span className="manager-avatar manager-skeleton" /><span className="manager-skeleton manager-skeleton-name" /></div></td>
    <td className="manager-mobile-number"><span className="manager-skeleton manager-skeleton-phone" /></td>
    <td className="manager-role"><span className="manager-skeleton manager-skeleton-role" /></td>
    <td><span className="manager-skeleton manager-skeleton-status" /></td>
  </tr>)}</>
}
