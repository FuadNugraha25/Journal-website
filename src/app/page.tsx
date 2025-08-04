import { getTrades } from '@/lib/data';
import { Header } from '@/components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardLayout } from '@/components/dashboard-layout';
import { AnalyzerView } from '@/components/analyzer-view';
import { TradesTable } from '@/components/trades-table';

export default async function Home() {
  const trades = await getTrades();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-[500px]">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="trade-history">Trade History</TabsTrigger>
            <TabsTrigger value="analyzer">AI Analyzer</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="mt-4">
            <DashboardLayout initialTrades={trades} />
          </TabsContent>
          <TabsContent value="trade-history" className="mt-4">
            <TradesTable trades={trades} />
          </TabsContent>
          <TabsContent value="analyzer" className="mt-4">
            <AnalyzerView trades={trades} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
