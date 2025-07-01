export default function StageDetailPage({
  params,
}: {
  params: { stageId: string };
}) {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold">Stage {params.stageId}</h1>
    </div>
  );
} 