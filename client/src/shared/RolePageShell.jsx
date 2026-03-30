import AdminShell from '../admin/common/AdminShell'
import FacultyShell from '../faculty/common/FacultyShell'
import IncubateeShell from '../incubatee/common/IncubateeShell'
import { getActiveRole } from '../lib/api'

function RolePageShell({ title, subtitle, badge, headerAction, children }) {
  const role = getActiveRole()

  if (role === 'admin') {
    return (
      <AdminShell
        activeKey=""
        title={title}
        subtitle={subtitle}
        badge={badge}
        headerAction={headerAction}
      >
        {children}
      </AdminShell>
    )
  }

  if (role === 'faculty') {
    return (
      <FacultyShell
        activeKey=""
        title={title}
        subtitle={subtitle}
        badge={badge}
        headerAction={headerAction}
      >
        {children}
      </FacultyShell>
    )
  }

  return (
    <IncubateeShell
      activeKey=""
      title={title}
      subtitle={subtitle}
      badge={badge}
      headerAction={headerAction}
    >
      {children}
    </IncubateeShell>
  )
}

export default RolePageShell
