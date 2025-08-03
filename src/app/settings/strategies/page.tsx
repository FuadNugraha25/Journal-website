import { Header } from "@/components/header";
import { getStrategies } from "@/lib/data";
import { StrategyManager } from "./strategy-manager";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function StrategySettingsPage() {
    const strategies = await getStrategies();

    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <Header />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Strategy Management</CardTitle>
                            <CardDescription>
                                Add or remove your trading strategies. These will be available when logging a new trade.
                            </CardDescription>
                        </CardHeader>
                        <StrategyManager initialStrategies={strategies} />
                    </Card>
                </div>
            </main>
        </div>
    )
}
