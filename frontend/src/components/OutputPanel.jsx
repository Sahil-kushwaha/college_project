import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

function OutputPanel({ output }) {
  if (output === null) {
    return (
      <div className="h-full bg-base-100 flex flex-col">
        <div className="px-4 py-2 bg-base-200 border-b border-base-300 font-semibold text-sm">
          Output
        </div>
        <div className="flex-1 overflow-auto p-4">
          <p className="text-base-content/50 text-sm">Click "Run Code" to see the output here...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-base-100 flex flex-col">
      <div className="px-4 py-2 bg-base-200 border-b border-base-300 font-semibold text-sm flex justify-between items-center">
        <span>Execution Results</span>
        {output.results && output.results.length > 0 && (
          <span className="text-xs font-normal opacity-70">
            {output.results.filter(r => r.passed).length} / {output.results.length} Tests Passed
          </span>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Critical Error Section */}
        {output.error && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/20 flex gap-3">
            <AlertCircle className="size-5 text-error shrink-0" />
            <div className="text-sm font-mono text-error whitespace-pre-wrap">
              <span className="font-bold">Error:</span> {output.error}
            </div>
          </div>
        )}

        {/* Individual Test Case Results */}
        {output.results && output.results.length > 0 ? (
          <div className="space-y-3">
            {output.results.map((result, index) => (
              <div key={index} className="card bg-base-200 shadow-sm overflow-hidden">
                <div className={`px-3 py-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
                  result.passed ? "bg-success/20 text-success" : "bg-error/20 text-error"
                }`}>
                  {result.passed ? <CheckCircle className="size-3" /> : <XCircle className la="size-3" />}
                  Test Case {index + 1}
                </div>
                <div className="p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-base-content/50 block mb-1">Input:</span>
                      <span className="break-all">{result.input || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-base-content/50 block mb-1">Expected:</span>
                      <span className="break-all">{result.expected || "N/A"}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-base-300">
                    <span className="text-xs font-bold text-base-content/70 block mb-1">Actual Output:</span>
                    <pre className={`text-sm font-mono whitespace-pre-wrap ${
                      result.passed ? "text-success" : "text-error"
                    }`}>
                      {result.output || "No output produced"}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !output.error && (
            <div className="text-center py-10">
              <p className="text-sm text-base-content/50">No test results available</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default OutputPanel;
