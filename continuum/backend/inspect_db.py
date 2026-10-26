import sqlite3
import os
import webbrowser
import json

DB_PATH = os.path.join(os.path.dirname(__file__), 'continuum.db')
HTML_PATH = os.path.join(os.path.dirname(__file__), 'database_viewer.html')

def generate_viewer():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at: {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    tables = [row[0] for row in cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").fetchall()]

    db_data = {}
    for table in tables:
        rows = cursor.execute(f"SELECT * FROM {table}").fetchall()
        db_data[table] = [dict(r) for r in rows]

    total_records = sum(len(rows) for rows in db_data.values())

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CONTINUUM Database Inspector | Review Panel Live View</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
  <style>
    body {{ background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }}
    .header-bar {{ background: #0f172a; color: #ffffff; padding: 18px 24px; border-bottom: 4px solid #0284c7; }}
    .table-container {{ background: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.04); }}
    .badge-gov {{ background-color: #0284c7; color: white; }}
    .tab-btn {{ font-weight: 600; font-size: 13px; }}
    table {{ font-size: 12px; }}
    th {{ background-color: #f1f5f9 !important; color: #334155; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; position: sticky; top: 0; }}
    td {{ vertical-align: middle; }}
  </style>
</head>
<body>
  <div class="header-bar d-flex justify-content-between align-items-center">
    <div>
      <span class="badge badge-gov text-uppercase mb-1">Ministry of Skill Development &amp; Entrepreneurship</span>
      <h4 class="mb-0 fw-bold">CONTINUUM — SQLite Enterprise Database Inspector</h4>
      <small class="text-secondary">Target DB: <code>{DB_PATH}</code></small>
    </div>
    <div class="text-end">
      <span class="badge bg-success fs-6">● LIVE DATABASE</span>
      <div class="text-light small mt-1">Total Tables: <strong>{len(tables)}</strong> | Total Records: <strong>{total_records}</strong></div>
    </div>
  </div>

  <div class="container-fluid py-4 px-4">
    <!-- Table Navigation Pills -->
    <ul class="nav nav-pills mb-3" id="dbTabs" role="tablist">
"""

    for i, table in enumerate(tables):
        active_class = "active" if i == 0 else ""
        count = len(db_data[table])
        html += f"""
      <li class="nav-item me-2 mb-2" role="presentation">
        <button class="nav-link {active_class} tab-btn" id="tab-{table}" data-bs-toggle="pill" data-bs-target="#content-{table}" type="button" role="tab">
          {table} <span class="badge bg-secondary ms-1">{count}</span>
        </button>
      </li>
"""

    html += """
    </ul>

    <!-- Table Contents -->
    <div class="tab-content" id="dbTabsContent">
"""

    for i, table in enumerate(tables):
        active_class = "show active" if i == 0 else ""
        rows = db_data[table]
        html += f"""
      <div class="tab-pane fade {active_class}" id="content-{table}" role="tabpanel">
        <div class="table-container">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0 text-dark">Table: <code>{table}</code> <small class="text-muted font-monospace">({len(rows)} rows)</small></h5>
            <input type="text" class="form-control form-control-sm w-25" placeholder="Search in {table}..." onkeyup="filterTable('{table}', this.value)">
          </div>
          <div class="table-responsive" style="max-height: 600px; overflow-y: auto;">
            <table class="table table-hover table-bordered table-striped" id="table-{table}">
              <thead>
                <tr>
"""
        if rows:
            columns = list(rows[0].keys())
            for col in columns:
                html += f"                  <th>{col}</th>\n"
            html += """                </tr>
              </thead>
              <tbody>
"""
            for row in rows:
                html += "                <tr>\n"
                for col in columns:
                    val = row.get(col)
                    if val is None:
                        val_str = '<span class="text-muted fst-italic">NULL</span>'
                    elif isinstance(val, (int, float)):
                        val_str = f"<strong>{val}</strong>"
                    else:
                        val_str = str(val)
                    html += f"                  <td>{val_str}</td>\n"
                html += "                </tr>\n"
        else:
            html += "<th>No Columns</th></tr></thead><tbody><tr><td>No records present</td></tr>"

        html += """
              </tbody>
            </table>
          </div>
        </div>
      </div>
"""

    html += """
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <script>
    function filterTable(tableId, query) {
      const filter = query.toLowerCase();
      const rows = document.querySelectorAll('#table-' + tableId + ' tbody tr');
      rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(filter) ? '' : 'none';
      });
    }
  </script>
</body>
</html>
"""

    with open(HTML_PATH, 'w', encoding='utf-8') as f:
        f.write(html)

    print(f"Generated standalone Database Inspector at: {HTML_PATH}")
    webbrowser.open(f"file://{HTML_PATH}")

if __name__ == '__main__':
    generate_viewer()
