export default function Rag() {
  const savePdf = async () => {
    try {
      const test = await fetch("/api/hello");
      console.log(test.json());
      const response = await fetch("/api/loadPdf");
      if (!response.ok) {
        throw new Error("Error loading PDF");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-4xl">Rag</h1>
      <button onClick={savePdf}>pdf</button>
      <a href="/pdfs/kitakuHazard.pdf" target="_blank">
        pdfファイルを開く
      </a>
    </div>
  );
}
