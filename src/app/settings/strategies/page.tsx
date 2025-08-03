import { Header } from "@/components/header";
import { getStrategies } from "@/lib/data";
import { StrategyManager } from "./strategy-manager";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function StrategySettingsPage() {
    const strategies = await getStrategies();

    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <Header />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
                            <Link href="/">
                                <ArrowLeft className="h-4 w-4" />
                                <span className="sr-only">Back</span>
                            </Link>
                        </Button>
                        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                            Strategy Settings
                        </h1>
                    </div>
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
