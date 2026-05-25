import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Navbar from "../components/Navbar";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ProblemDescription from "../components/ProblemDescription";
import OutputPanel from "../components/OutputPanel";
import CodeEditorPanel from "../components/CodeEditorPanel";
import { executeCode } from "../lib/piston";
import { problemApi } from "../api/problems";

import toast from "react-hot-toast";
import confetti from "canvas-confetti";

function ProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentProblem, setCurrentProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // fetch problem data from API
  useEffect(() => {
    async function loadProblem() {
      try {
        setIsLoading(true);
        const problem = await problemApi.getProblem(id);
        setCurrentProblem(problem);

        // Use static starter code as fallback since it's not in DB
        setCode(getStarterCode(problem.slug, selectedLanguage));
      } catch (error) {
        toast.error("Failed to load problem");
        navigate("/problems");
      } finally {
        setIsLoading(false);
      }
    }
    loadProblem();
  }, [id]);

  // update code when language changes
  useEffect(() => {
    if (currentProblem) {
      setCode(getStarterCode(currentProblem.slug, selectedLanguage));
    }
  }, [selectedLanguage, currentProblem]);

  const getStarterCode = (slug, lang) => {
    try {
      // Use the static data file as a source for starter codes
      const { PROBLEMS } = require("../data/problems");
      return PROBLEMS[slug]?.starterCode?.[lang] || "// Write your code here";
    } catch (e) {
      return "// Write your code here";
    }
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    setOutput(null);
  };

  const handleProblemChange = (newProblemId) => navigate(`/problem/${newProblemId}`);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 250,
      origin: { x: 0.2, y: 0.6 },
    });

    confetti({
      particleCount: 80,
      spread: 250,
      origin: { x: 0.8, y: 0.6 },
    });
  };

  const normalizeOutput = (output) => {
    return output
      .trim()
      .split("\n")
      .map((line) =>
        line
          .trim()
          .replace(/\[\s+/g, "[")
          .replace(/\s+\]/g, "]")
          .replace(/\s*,\s*/g, ",")
      )
      .filter((line) => line.length > 0)
      .join("\n");
  };

  const checkIfTestsPassed = (actualOutput, expectedOutput) => {
    const normalizedActual = normalizeOutput(actualOutput);
    const normalizedExpected = normalizeOutput(expectedOutput);

    return normalizedActual == normalizedExpected;
  };

  const handleRunCode = async () => {
    if (!currentProblem) return;

    setIsRunning(true);
    setOutput(null);

    const result = await executeCode(selectedLanguage, code, currentProblem._id);
    console.log(result);
    setOutput(result);
    setIsRunning(false);

    if (result.success) {
      const { PROBLEMS } = require("../data/problems");
      const expectedOutput = PROBLEMS[currentProblem.slug]?.expectedOutput?.[selectedLanguage];

      if (expectedOutput) {
        const testsPassed = checkIfTestsPassed(result.output, expectedOutput);
        if (testsPassed) {
          triggerConfetti();
          toast.success("All tests passed! Great job!");
        } else {
          toast.error("Tests failed. Check your output!");
        }
      } else {
        toast.success("Code executed successfully!");
      }
    } else {
      toast.error("Code execution failed!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="h-screen bg-base-100 flex flex-col">
      <Navbar />

      <div className="flex-1">
        <PanelGroup direction="horizontal">
          {/* left panel- problem desc */}
          <Panel defaultSize={40} minSize={30}>
            <ProblemDescription
              problem={currentProblem}
              currentProblemId={currentProblem.slug}
              onProblemChange={handleProblemChange}
              allProblems={[]}
            />
          </Panel>

          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

          {/* right panel- code editor & output */}
          <Panel defaultSize={60} minSize={30}>
            <PanelGroup direction="vertical">
              {/* Top panel - Code editor */}
              <Panel defaultSize={70} minSize={30}>
                <CodeEditorPanel
                  selectedLanguage={selectedLanguage}
                  code={code}
                  isRunning={isRunning}
                  onLanguageChange={handleLanguageChange}
                  onCodeChange={setCode}
                  onRunCode={handleRunCode}
                />
              </Panel>

              <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

              {/* Bottom panel - Output Panel*/}

              <Panel defaultSize={30} minSize={30}>
                <OutputPanel output={output} />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default ProblemPage;
