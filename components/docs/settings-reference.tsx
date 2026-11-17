import settings from "@/content/generated/settings.json";

type Row = (typeof settings.groups)[number]["rows"][number];

/** How a default reads: On/Off for flags, the stored choice, the range for counts. */
function defaultOf(row: Row) {
  if (row.kind === "flag") return row.default ? "On" : "Off";
  if (row.kind === "choice") return String(row.default);
  if (row.kind === "count") return `${row.default} (${row.min} to ${row.max})`;
  if (row.kind === "number") return String(row.default);
  if (row.kind === "text") return row.maxChars ? `Text, up to ${row.maxChars} characters` : "Text";
  return "JSON";
}

function valuesOf(row: Row) {
  if (row.kind === "choice" && row.options) return row.options.join(", ");
  if (row.kind === "count") return `${row.min} to ${row.max}`;
  if (row.kind === "flag") return "On or off";
  if (row.kind === "number") return "A number";
  if (row.kind === "text") return "Free text";
  return "A JSON document";
}

/**
 * The complete stored-settings reference. The rows come from the app's settings registry;
 * `scripts/docs/settings-meta.mjs` supplies the public labels and grouping. Do not hand-edit
 * `content/generated/settings.json`.
 */
export function SettingsReference() {
  return (
    <div className="docs-ref">
      <p className="docs-ref-note">
        Every setting the app stores and lets its window read or write. A setting marked{" "}
        <b>This device</b> stays on the machine it was set on. <b>Synced</b> means device sync
        carries it to your other devices when sync is on.
      </p>
      {settings.groups.map((group) => (
        <section key={group.id} id={`settings-ref-${group.id}`} className="docs-ref-group">
          <h3>{group.title}</h3>
          <p className="docs-ref-blurb">{group.blurb}</p>
          <div className="docs-ref-scroll">
            <table className="docs-ref-table">
              <caption className="sr-only">
                {group.title} settings, their keys and defaults
              </caption>
              <thead>
                <tr>
                  <th scope="col">Setting</th>
                  <th scope="col">Default</th>
                  <th scope="col">Values</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row) => (
                  <tr key={row.key}>
                    <th scope="row">
                      <span className="docs-ref-label">{row.label}</span>
                      <code className="docs-ref-key">{row.key}</code>
                      <span className="docs-ref-summary">{row.summary}</span>
                    </th>
                    <td>
                      <span className="docs-ref-default">{defaultOf(row)}</span>
                      <span className="docs-ref-scope">
                        {row.scope === "synced" ? "Synced" : "This device"}
                      </span>
                    </td>
                    <td className="docs-ref-values">{valuesOf(row)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
