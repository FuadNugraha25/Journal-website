
'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormState } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, Loader2, PlusCircle, Settings, ClipboardPaste, X } from 'lucide-react';
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
  FormDescription,
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
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import type { TradeOutcome } from '@/lib/types';
import { getStrategies } from '@/lib/data';
import Link from 'next/link';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import Image from 'next/image';
import { ScrollArea } from './ui/scroll-area';

  const tradeSchema = z.object({
    pair: z.enum(['XAUUSD', 'GBPJPY', 'EURUSD'], { required_error: 'Please select a pair.' }),
    type: z.enum(['buy', 'sell'], { required_error: 'Please select a trade type.' }),
    profit: z.coerce.number(),
    outcome: z.enum(['tp', 'sl', 'breakeven', 'cp', 'cl'], { required_error: 'Please select an outcome.' }),
    riskRewardRatio: z.coerce.number(),
    closeDate: z.date({ required_error: 'Please select a date.' }),
    strategy: z.string({ required_error: 'Please select a strategy.' }),
    session: z.enum(['Asian', 'London', 'New York'], { required_error: 'Please select a session.' }),
    image: z.string().optional(),
    lotSize: z.coerce.number().required({ required_error: 'Lot size is required.' }),
    riskSize: z.coerce.number().required({ required_error: 'Risk size is required.' }),
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
  const [strategies, setStrategies] = useState<string[]>([]);
  const [pastedImage, setPastedImage] = useState<string | null>(null);

  useEffect(() => {
    getStrategies().then(setStrategies);
  }, []);

  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeSchema),
  defaultValues: {
    profit: 0,
    riskRewardRatio: 1,
    outcome: 'tp',
    lotSize: 0.1,
    riskSize: 50,
  },
  });

  const { formState: RHFFormState, watch, setValue, reset } = form;
  const outcome = watch('outcome');
  const type = watch('type');

  useEffect(() => {
    if (outcome === 'sl' || outcome === 'cl') {
      const currentProfit = form.getValues('profit');
      if (currentProfit > 0) setValue('profit', currentProfit * -1);
      if (outcome === 'sl') setValue('riskRewardRatio', -1);
    } else if (outcome === 'breakeven') {
      setValue('riskRewardRatio', 0);
      setValue('profit', 0);
    } else if (outcome === 'tp' || outcome === 'cp') {
        const currentProfit = form.getValues('profit');
        if (currentProfit < 0) setValue('profit', Math.abs(currentProfit));
    }
  }, [outcome, setValue, form]);

  useEffect(() => {
    if (formState.message && !formState.errors) {
      toast({
        title: 'Success!',
        description: formState.message,
      });
      setOpen(false);
      reset();
      setPastedImage(null);
    } else if (formState.message && formState.errors) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: formState.message,
      });
    }
  }, [formState, toast, reset]);

  const onFormSubmit = (data: TradeFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value instanceof Date) {
            formData.append(key, value.toISOString());
        } else if (value !== undefined && value !== null) {
            formData.append(key, String(value));
        }
    });
    formAction(formData);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const dataUrl = e.target?.result as string;
                    setPastedImage(dataUrl);
                    setValue('image', dataUrl, { shouldValidate: true });
                };
                reader.readAsDataURL(blob);
            }
            event.preventDefault();
            break;
        }
    }
  };

  const handleClearImage = () => {
    setPastedImage(null);
    setValue('image', undefined, { shouldValidate: true });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Trade
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Log a New Trade</DialogTitle>
          <DialogDescription>
            Add the details of your completed trade here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            ref={formRef}
            onSubmit={form.handleSubmit(onFormSubmit)}
            className="grid gap-4"
          >
            <ScrollArea className="h-[60vh] w-full pr-6">
              <div className="space-y-4">
                 <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trade Image</FormLabel>
                        <FormControl>
                            {pastedImage ? (
                                <div className="relative">
                                    <Image src={pastedImage} alt="Pasted trade setup" width={500} height={300} className="rounded-md border object-contain"/>
                                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={handleClearImage}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div 
                                    onPaste={handlePaste}
                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <ClipboardPaste className="w-8 h-8 mb-4 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground">
                                        <span className="font-semibold">Click or paste image</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground">Paste a screenshot of your trade</p>
                                    </div>
                                    <input type="hidden" {...field} />
                                </div>
                            )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                
                <FormField
                  control={form.control}
                  name="outcome"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Outcome</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-5 gap-2"
                        >
                          <OutcomeOption value="tp" label="TP" description="Full Take Profit" />
                          <OutcomeOption value="cp" label="CP" description="Partial/Cut Profit" />
                          <OutcomeOption value="breakeven" label="BE" description="Breakeven" />
                          <OutcomeOption value="cl" label="CL" description="Partial/Cut Loss" />
                          <OutcomeOption value="sl" label="SL" description="Full Stop Loss" />
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="profit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>P/L ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" placeholder="e.g. 150.50" {...field} disabled={outcome === 'breakeven'} />
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
                          <Input type="number" step="any" placeholder="e.g. 2.5" {...field} disabled={outcome === 'sl' || outcome === 'breakeven'} />
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
                      <div className="flex items-center gap-2">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a strategy" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {strategies.map((strategy) => (
                              <SelectItem key={strategy} value={strategy}>{strategy}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button asChild variant="ghost" size="icon">
                          <Link href="/settings/strategies">
                            <Settings className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
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
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button type="submit" disabled={RHFFormState.isSubmitting}>
                  {RHFFormState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function OutcomeOption({ value, label, description }: { value: TradeOutcome, label: string, description: string }) {
  const baseClasses = "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer";
  const stateClasses = {
    tp: "peer-data-[state=checked]:border-green-500 [&:has([data-state=checked])]:border-green-500",
    cp: "peer-data-[state=checked]:border-green-800 [&:has([data-state=checked])]:border-green-800",
    breakeven: "peer-data-[state=checked]:border-yellow-500 [&:has([data-state=checked])]:border-yellow-500",
    cl: "peer-data-[state=checked]:border-red-800 [&:has([data-state=checked])]:border-red-800",
    sl: "peer-data-[state=checked]:border-destructive [&:has([data-state=checked])]:border-destructive",
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <FormItem>
            <FormControl>
              <RadioGroupItem value={value} id={value} className="peer sr-only" />
            </FormControl>
            <FormLabel htmlFor={value} className={cn(baseClasses, stateClasses[value])}>
              {label}
            </FormLabel>
          </FormItem>
        </TooltipTrigger>
        <TooltipContent>
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

    