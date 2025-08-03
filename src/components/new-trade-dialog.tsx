'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormState } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, Loader2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { addTradeAction, type FormState } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from './ui/calendar';

const tradeSchema = z.object({
  pair: z.enum(['XAUUSD', 'GBPJPY', 'EURUSD'], { required_error: 'Please select a pair.' }),
  type: z.enum(['buy', 'sell'], { required_error: 'Please select a trade type.' }),
  profit: z.coerce.number(),
  riskRewardRatio: z.coerce.number().positive('Risk/Reward Ratio must be positive'),
  closeDate: z.date({ required_error: 'Please select a date.' }),
  strategy: z.enum(["Scalping", "Swing Trading", "Day Trading", "Position Trading"], { required_error: 'Please select a strategy.' }),
  session: z.enum(['Asian', 'London', 'New York'], { required_error: 'Please select a session.' }),
});

type TradeFormValues = z.infer<typeof tradeSchema>;

const initialState: FormState = {
  message: '',
};

export function NewTradeDialog() {
  const [open, setOpen] = useState(false);
  const [formState, formAction] = useFormState(addTradeAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      profit: 0,
      riskRewardRatio: 1,
    },
  });

  const { formState: RHFFormState } = form;

  useEffect(() => {
    if (formState.message && !formState.errors) {
      toast({
        title: 'Success!',
        description: formState.message,
      });
      setOpen(false);
      form.reset();
    } else if (formState.message && formState.errors) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: formState.message,
      });
    }
  }, [formState, toast, form]);

  const onFormSubmit = (data: TradeFormValues) => {
    const formData = new FormData();
    formData.append('pair', data.pair);
    formData.append('type', data.type);
    formData.append('profit', String(data.profit));
    formData.append('riskRewardRatio', String(data.riskRewardRatio));
    formData.append('closeDate', data.closeDate.toISOString());
    formData.append('strategy', data.strategy);
    formData.append('session', data.session);
    
    formAction(formData);
  };
  

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Trade
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Log a New Trade</DialogTitle>
          <DialogDescription>
            Add the details of your completed trade here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            ref={formRef}
            action={formAction}
            onSubmit={form.handleSubmit(onFormSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pair"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pair</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a currency pair" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="XAUUSD">XAU/USD</SelectItem>
                        <SelectItem value="GBPJPY">GBP/JPY</SelectItem>
                        <SelectItem value="EURUSD">EUR/USD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select trade type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="buy">Buy</SelectItem>
                        <SelectItem value="sell">Sell</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="profit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>P/L ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="e.g. 150.50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="riskRewardRatio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk/Reward Ratio</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="e.g. 2.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="strategy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Strategy</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a strategy" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Scalping">Scalping</SelectItem>
                      <SelectItem value="Swing Trading">Swing Trading</SelectItem>
                      <SelectItem value="Day Trading">Day Trading</SelectItem>
                      <SelectItem value="Position Trading">Position Trading</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="session"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a session" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Asian">Asian</SelectItem>
                      <SelectItem value="London">London</SelectItem>
                      <SelectItem value="New York">New York</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="closeDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Close Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <SubmitButton pending={RHFFormState.isSubmitting} />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function SubmitButton({ pending }: { pending: boolean }) {
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
        </Button>
    )
}
