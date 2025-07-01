export default async function StageDetailPage({
  params,
}: {
  params: Promise<{ stageId: string }>;
}) {
  const { stageId } = await params;
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold">Stage {stageId}</h1>
    </div>
  );
} 