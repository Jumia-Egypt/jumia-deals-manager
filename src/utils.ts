import { Zap, Clock, Calendar as CalendarIcon, Tag, Heart, Sun, Wallet, Cake, Backpack, MoonStar, Users, Beef, Sparkles } from 'lucide-react';

export const getCampaignStyle = (name: string) => {
  if (name.includes('Flash Sale')) {
    return { icon: Zap, bg: 'bg-red-50', ring: 'ring-red-200/60', text: 'text-red-700', iconColor: 'text-red-500' };
  }
  if (name.includes('Daily Deal')) {
    return { icon: Clock, bg: 'bg-blue-50', ring: 'ring-blue-200/60', text: 'text-blue-700', iconColor: 'text-blue-500' };
  }
  if (name.includes('Week End Offer')) {
    return { icon: CalendarIcon, bg: 'bg-purple-50', ring: 'ring-purple-200/60', text: 'text-purple-700', iconColor: 'text-purple-500' };
  }
  if (name.includes('JUMIA Anniversary')) {
    return { icon: Cake, bg: 'bg-orange-50', ring: 'ring-orange-200/60', text: 'text-orange-700', iconColor: 'text-orange-500' };
  }
  if (name.includes('Black Friday')) {
    return { icon: Tag, bg: 'bg-slate-800', ring: 'ring-slate-700', text: 'text-white', iconColor: 'text-slate-300' };
  }
  if (name.includes('Mothers Day')) {
    return { icon: Users, bg: 'bg-pink-50', ring: 'ring-pink-200/60', text: 'text-pink-700', iconColor: 'text-pink-500' };
  }
  if (name.includes('Valentines Day')) {
    return { icon: Heart, bg: 'bg-rose-50', ring: 'ring-rose-200/60', text: 'text-rose-700', iconColor: 'text-rose-500' };
  }
  if (name.includes('Back to School')) {
    return { icon: Backpack, bg: 'bg-indigo-50', ring: 'ring-indigo-200/60', text: 'text-indigo-700', iconColor: 'text-indigo-500' };
  }
  if (name.includes('Eid Adha')) {
    return { icon: Beef, bg: 'bg-stone-50', ring: 'ring-stone-200/60', text: 'text-stone-700', iconColor: 'text-stone-500' };
  }
  if (name.includes('Ramadan') || name.includes('Ramdan')) {
    return { icon: MoonStar, bg: 'bg-amber-50', ring: 'ring-amber-200/60', text: 'text-amber-700', iconColor: 'text-amber-500' };
  }
  if (name.includes('Summer Campaign')) {
    return { icon: Sun, bg: 'bg-yellow-50', ring: 'ring-yellow-200/60', text: 'text-yellow-700', iconColor: 'text-yellow-500' };
  }
  if (name.includes('Pay Week')) {
    return { icon: Wallet, bg: 'bg-emerald-50', ring: 'ring-emerald-200/60', text: 'text-emerald-700', iconColor: 'text-emerald-500' };
  }
  return { icon: Sparkles, bg: 'bg-white', ring: 'ring-orange-200/60', text: 'text-orange-700', iconColor: 'text-orange-400' };
};
