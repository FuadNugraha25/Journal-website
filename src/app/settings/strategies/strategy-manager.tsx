'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateStrategiesAction } from '@/lib/actions';
import { X, Plus, Loader2 } from 'lucide-react';

export function StrategyManager({ initialStrategies }: { initialStrategies: string[] }) {
  const [strategies, setStrategies] = useState(initialStrategies);
  const [newStrategy, setNewStrategy] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleAddStrategy = () => {
    if (newStrategy.trim() && !strategies.includes(newStrategy.trim())) {
      setStrategies([...strategies, newStrategy.trim()]);
      setNewStrategy('');
    }
  };

  const handleRemoveStrategy = (strategyToRemove: string) => {
    setStrategies(strategies.filter((s) => s !== strategyToRemove));
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateStrategiesAction(strategies);
      if (result.message.includes('success')) {
        toast({
          title: 'Success!',
          description: result.message,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      }
    });
  };

  return (
    <>
      <CardContent>
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Your Strategies</label>
                <div className="flex flex-col gap-2">
                {strategies.map((strategy) => (
                    <div key={strategy} className="flex items-center gap-2">
                    <Input value={strategy} readOnly className="flex-1 bg-muted" />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveStrategy(strategy)}
                        aria-label={`Remove ${strategy}`}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    </div>
                ))}
                </div>
            </div>
             <div className="space-y-2">
                <label htmlFor="new-strategy" className="text-sm font-medium">Add a new strategy</label>
                <div className="flex items-center gap-2">
                    <Input
                        id="new-strategy"
                        value={newStrategy}
                        onChange={(e) => setNewStrategy(e.target.value)}
                        placeholder="e.g., News Trading"
                    />
                    <Button variant="outline" size="icon" onClick={handleAddStrategy} aria-label="Add new strategy">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </CardFooter>
    </>
  );
}
