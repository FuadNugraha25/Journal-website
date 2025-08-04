'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateInitialCapitalAction } from '@/lib/actions';
import { Loader2 } from 'lucide-react';

export function CapitalManager({ initialCapital }: { initialCapital: number }) {
  const [capital, setCapital] = useState(initialCapital);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateInitialCapitalAction(capital);
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
        <div className="grid gap-2">
            <label htmlFor="initial-capital" className="text-sm font-medium">Amount ($)</label>
            <Input
                id="initial-capital"
                type="number"
                value={capital}
                onChange={(e) => setCapital(Number(e.target.value))}
                placeholder="e.g., 10000"
            />
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Capital
        </Button>
      </CardFooter>
    </>
  );
}
