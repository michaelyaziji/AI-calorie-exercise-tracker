import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, subDays, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";

interface DateSelectorProps {
  onDateChange: (date: Date) => void;
  selectedDate: Date;
}

export default function DateSelector({ onDateChange, selectedDate }: DateSelectorProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: false,
    dragFree: true,
  });

  // Generate array of dates (7 days before and after today)
  const generateDates = useCallback(() => {
    const dates = [];
    for (let i = -7; i <= 7; i++) {
      const date = addDays(new Date(), i);
      date.setHours(0, 0, 0, 0);
      dates.push(date);
    }
    return dates;
  }, []);

  const [dates] = useState(generateDates());

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Scroll to today when component mounts
  useEffect(() => {
    if (emblaApi) {
      const index = dates.findIndex(date => 
        isSameDay(date, selectedDate)
      );
      emblaApi.scrollTo(index);
    }
  }, [emblaApi, dates, selectedDate]);

  return (
    <div className="relative">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollPrev}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="overflow-hidden mx-8" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {dates.map((date, i) => (
            <div
              key={i}
              className="flex-[0_0_33.33%] min-w-0 relative px-2"
            >
              <Button
                variant={isSameDay(date, selectedDate) ? "default" : "ghost"}
                className="w-full h-full py-6"
                onClick={() => onDateChange(date)}
              >
                <div className="text-center">
                  <div className="text-sm font-medium">
                    {format(date, "EEE")}
                  </div>
                  <div className="text-2xl font-bold">
                    {format(date, "d")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(date, "MMM")}
                  </div>
                </div>
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollNext}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
