import shortcuts from "@/content/generated/shortcuts.json";

/**
 * The global shortcuts, generated from the app's keyboard handler. Shortcuts that belong to
 * one control are documented by hand on the page.
 */
export function ShortcutsReference() {
  return (
    <div className="docs-ref docs-shortcuts">
      <div className="docs-ref-scroll">
        <table className="docs-ref-table">
          <caption className="sr-only">Global keyboard shortcuts</caption>
          <thead>
            <tr>
              <th scope="col">Action</th>
              <th scope="col">macOS</th>
              <th scope="col">Windows and Linux</th>
            </tr>
          </thead>
          <tbody>
            {shortcuts.shortcuts.map((row) => (
              <tr key={`${row.action}-${row.mac}`}>
                <th scope="row">{row.action}</th>
                <td>
                  <kbd className="docs-kbd">{row.mac}</kbd>
                </td>
                <td>
                  <kbd className="docs-kbd">{row.other}</kbd>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="docs-ref-note">{shortcuts.note}</p>
    </div>
  );
}
