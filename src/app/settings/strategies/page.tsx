import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getStrategies } from "@/lib/data";

export default async function StrategySettingsPage() {
    const strategies = await getStrategies();
    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <Header />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="grid gap-4">
                    <h1 className="text-2xl font-bold font-headline">Strategy Settings</h1>
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Strategies</CardTitle>
                            <CardDescription>Add, edit, or remove your trading strategies.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc pl-5">
                                {strategies.map(s => <li key={s}>{s}</li>)}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
