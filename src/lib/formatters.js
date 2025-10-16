// Shared UI formatters

// Format welcome text consistently across pages
// Returns a string like: "ยินดีต้อนรับ, {displayName} {Dept1, Dept2} ({Plant1, Plant2})"
// Inputs:
// - user: { display_name, username, department, plant_id, department_id, department_ids }
// - departments: [{ id, code, name, plant_id, plant_code }]
// - plants: [{ id, code, name }]
export function formatWelcome(user, departments = [], plants = []) {
  if (!user) return "";
  const displayName = user.display_name || user.username || "";

  // Special display for adminga: show all plant codes to reflect global scope
  try {
    const isAdminga = String(user.username || '').toLowerCase() === 'adminga';
    if (isAdminga) {
      const allPlantCodes = (plants || []).map(p => p?.code).filter(Boolean);
      if (allPlantCodes.length) {
        return `${displayName} ${allPlantCodes.join(' ')}`;
      }
      // Fallback to default formatting below if no plants are loaded yet
    }
  } catch {}

  // Collect department ids (multi first, then single, else none)
  const deptIds = (Array.isArray(user.department_ids) && user.department_ids.length)
    ? user.department_ids
    : (user.department_id ? [user.department_id] : []);

  // Build department label list
  const deptLabels = [];
  const plantCodesFromDepts = new Set();
  if (deptIds.length) {
    for (const id of deptIds) {
      const d = (departments || []).find(x => x.id === id);
      if (d) {
        const label = d.code || d.name || "";
        if (label) deptLabels.push(label);
        if (d.plant_code) plantCodesFromDepts.add(d.plant_code);
        else if (d.plant_id) {
          const p = (plants || []).find(pp => pp.id === d.plant_id);
          if (p?.code) plantCodesFromDepts.add(p.code);
        }
      }
    }
  }

  // Fallback dept label when master data is missing
  if (!deptLabels.length && user.department) {
    deptLabels.push(user.department);
  }

  // Build plant code list
  const plantLabels = new Set(plantCodesFromDepts);
  if (!plantLabels.size && user.plant_id) {
    const p = (plants || []).find(pp => pp.id === user.plant_id);
    if (p?.code) plantLabels.add(p.code);
  }

  const deptStr = deptLabels.join(", ");
  const plantStr = Array.from(plantLabels).join(", ");

  const tail = plantStr ? ` (${plantStr})` : (user.department && !deptStr ? ` (${user.department})` : "");
  return `${displayName}${deptStr ? ` ${deptStr}` : ""}${tail}`;
}
