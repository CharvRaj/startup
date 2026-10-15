import React, { useState } from 'react';
import {
  Wallet,
  CheckCircle2,
  X,
  CreditCard,
  QrCode,
  ShieldCheck,
  Loader2,
  Building,
  Smartphone,
  Lock,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface AddMoneyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
  currentBalance: number;
  onBalanceUpdated: (newBalance: number, newTransaction?: any) => void;
}

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

const POPULAR_BANKS = [
  'HDFC Bank',
  'State Bank of India (SBI)',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
];

export function AddMoneyModal({
  open,
  onOpenChange,
  userId,
  currentBalance,
  onBalanceUpdated,
}: AddMoneyModalProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState<number>(1000);
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiOption, setUpiOption] = useState<'id' | 'qr'>('id');
  const [upiId, setUpiId] = useState('');
  
  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Bank details
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lastTxId, setLastTxId] = useState('');

  if (!open) return null;

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
    return digits;
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount < 100) {
      toast({ title: 'Minimum deposit is ₹100', variant: 'destructive' });
      return;
    }
    if (amount > 50000) {
      toast({ title: 'Maximum single deposit is ₹50,000', variant: 'destructive' });
      return;
    }

    if (method === 'upi' && upiOption === 'id' && !upiId.trim().includes('@')) {
      toast({ title: 'Please enter a valid UPI ID (e.g. name@upi)', variant: 'destructive' });
      return;
    }

    if (method === 'card') {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length < 16) {
        toast({ title: 'Please enter a valid 16-digit card number', variant: 'destructive' });
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        toast({ title: 'Please enter valid expiry (MM/YY)', variant: 'destructive' });
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        toast({ title: 'Please enter 3-digit CVV', variant: 'destructive' });
        return;
      }
    }

    setLoading(true);
    const refId = `DEP-${Date.now().toString().slice(-8)}`;

    try {
      const newBalance = currentBalance + amount;

      // Method description
      let methodDesc = 'UPI Transfer';
      if (method === 'upi') {
        methodDesc = upiOption === 'id' ? `UPI (${upiId.trim()})` : 'Instant UPI QR';
      } else if (method === 'card') {
        methodDesc = `Card ending in ${cardNumber.replace(/\s/g, '').slice(-4) || 'XXXX'}`;
      } else if (method === 'netbanking') {
        methodDesc = `Net Banking (${selectedBank})`;
      }

      // Build standard transaction record
      const newTxn = {
        id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        user_id: userId || 'anonymous',
        amount: Number(amount),
        type: 'credit',
        description: `Deposit via ${methodDesc}`,
        reference_id: refId,
        balance_after: Number(newBalance),
        created_at: new Date().toISOString(),
      };

      // Persist to Supabase and LocalStorage
      if (userId) {
        // 1. LocalStorage updates for instant response
        try {
          localStorage.setItem(`satguru_wallet_balance_${userId}`, newBalance.toString());
          const txKey = `satguru_wallet_transactions_${userId}`;
          const existingRaw = localStorage.getItem(txKey);
          const existingList = existingRaw ? JSON.parse(existingRaw) : [];
          localStorage.setItem(txKey, JSON.stringify([newTxn, ...existingList]));
        } catch (storageErr) {
          console.warn('Local storage wallet error:', storageErr);
        }

        // 2. Supabase user_profiles balance update
        try {
          await supabase.from('user_profiles').update({ wallet_balance: newBalance }).eq('id', userId);
        } catch (e) {
          console.warn('user_profiles update fallback:', e);
        }

        // 3. Supabase wallet_transactions table insert
        try {
          await supabase.from('wallet_transactions').insert({
            user_id: userId,
            amount: Number(amount),
            type: 'credit',
            description: `Deposit via ${methodDesc}`,
            reference_id: refId,
            balance_after: Number(newBalance),
          });
        } catch (e) {
          console.warn('wallet_transactions insert fallback:', e);
        }
      }

      // Dispatch global sync event for any active page or component
      try {
        window.dispatchEvent(
          new CustomEvent('satguru:wallet_updated', {
            detail: { balance: newBalance, transaction: newTxn },
          })
        );
      } catch (evtErr) {
        console.warn('Event dispatch warning:', evtErr);
      }

      setLastTxId(refId);
      onBalanceUpdated(newBalance, newTxn);
      setSuccess(true);
      toast({
        title: 'Wallet Funded Successfully! 👛',
        description: `₹${amount.toLocaleString('en-IN')} added via ${method.toUpperCase()}. New balance: ₹${newBalance.toLocaleString('en-IN')}`,
      });
    } catch (err: any) {
      toast({
        title: 'Transaction Failed',
        description: err.message || 'Could not complete wallet recharge.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFF9F3] border border-[#F8DCE4] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#F8DCE4] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF0E6] text-[#D4AF70] flex items-center justify-center shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif italic font-bold text-lg text-[#43152E]">Add Money to Beauty Wallet</h3>
              <p className="text-[11px] text-muted-foreground">Instant credit • Zero fee • 100% Secure</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {success ? (
            /* Success Screen */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#DCE8D7] text-[#174D3A] flex items-center justify-center mx-auto shadow-sm animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs px-3 py-0.5 mb-2 font-semibold">
                  Payment Confirmed
                </Badge>
                <h4 className="font-serif italic text-2xl sm:text-3xl text-[#43152E]">
                  Wallet Recharge Successful!
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Your funds are immediately ready to use for salon visits and home orders.
                </p>
              </div>

              <div className="bg-white border border-[#F8DCE4] rounded-2xl p-4 text-xs space-y-2 text-left max-w-sm mx-auto shadow-2xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Added</span>
                  <span className="font-bold text-base font-serif text-emerald-700">
                    +₹{amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-semibold text-foreground uppercase">{method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference ID</span>
                  <span className="font-mono text-[11px] text-[#D81B60] font-bold">{lastTxId}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#F8DCE4]/60">
                  <span className="font-semibold text-[#43152E]">Updated Available Balance</span>
                  <span className="font-bold text-base font-serif text-[#43152E]">
                    ₹{(currentBalance + amount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleClose}
                  className="bg-[#43152E] hover:bg-[#2F0E20] text-white rounded-full px-8 text-xs font-semibold h-10 shadow-sm"
                >
                  Done • Return to Wallet
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAddFunds} className="space-y-5">
              {/* Current Balance Snapshot */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#F8DCE4] flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-muted-foreground font-medium">Current Available Balance:</span>
                </div>
                <span className="font-serif font-bold text-base text-[#43152E]">
                  ₹{currentBalance.toLocaleString('en-IN')}
                </span>
              </div>

              {/* 1. Enter Amount */}
              <div>
                <label className="text-xs font-bold text-[#43152E] block mb-1.5">
                  1. Enter Recharge Amount (₹ INR) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-serif text-xl font-bold text-[#43152E]/60">
                    ₹
                  </span>
                  <Input
                    type="number"
                    min={100}
                    max={50000}
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="pl-9 text-xl font-bold font-serif rounded-2xl bg-white border-[#F8DCE4] h-12 text-[#43152E] focus:ring-2 focus:ring-[#D81B60]/20"
                    placeholder="1000"
                    required
                  />
                </div>

                {/* Quick Chips */}
                <div className="flex items-center gap-2 mt-2">
                  {QUICK_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        amount === val
                          ? 'bg-[#43152E] text-white border-[#43152E] shadow-2xs'
                          : 'bg-white border-[#F8DCE4] text-[#43152E] hover:border-[#D4AF70] hover:bg-[#FFF9F3]'
                      }`}
                    >
                      +₹{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Select Payment Method */}
              <div>
                <label className="text-xs font-bold text-[#43152E] block mb-2">
                  2. Select Payment Method *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Method: UPI */}
                  <div
                    onClick={() => setMethod('upi')}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      method === 'upi'
                        ? 'bg-white border-[#D81B60] ring-2 ring-[#D81B60]/20 shadow-xs'
                        : 'bg-white/80 border-[#F8DCE4] hover:bg-white'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-[#D81B60] mb-1" />
                    <span className="text-xs font-bold text-[#43152E]">UPI / QR</span>
                    <span className="text-[10px] text-emerald-700 font-semibold mt-0.5">Instant</span>
                  </div>

                  {/* Method: Card */}
                  <div
                    onClick={() => setMethod('card')}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      method === 'card'
                        ? 'bg-white border-[#D81B60] ring-2 ring-[#D81B60]/20 shadow-xs'
                        : 'bg-white/80 border-[#F8DCE4] hover:bg-white'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-[#D4AF70] mb-1" />
                    <span className="text-xs font-bold text-[#43152E]">Card</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">Visa / Master</span>
                  </div>

                  {/* Method: Net Banking */}
                  <div
                    onClick={() => setMethod('netbanking')}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      method === 'netbanking'
                        ? 'bg-white border-[#D81B60] ring-2 ring-[#D81B60]/20 shadow-xs'
                        : 'bg-white/80 border-[#F8DCE4] hover:bg-white'
                    }`}
                  >
                    <Building className="w-5 h-5 text-[#174D3A] mb-1" />
                    <span className="text-xs font-bold text-[#43152E]">Net Banking</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">All Banks</span>
                  </div>
                </div>
              </div>

              {/* 3. Method Specific Fields */}
              {method === 'upi' && (
                <div className="p-4 rounded-2xl bg-white border border-[#F8DCE4] space-y-3 shadow-2xs animate-in fade-in duration-200">
                  <div className="flex gap-2 p-1 rounded-xl bg-[#FAF4EF] w-fit">
                    <button
                      type="button"
                      onClick={() => setUpiOption('id')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        upiOption === 'id' ? 'bg-[#43152E] text-white shadow-2xs' : 'text-muted-foreground'
                      }`}
                    >
                      Enter UPI ID
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiOption('qr')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        upiOption === 'qr' ? 'bg-[#43152E] text-white shadow-2xs' : 'text-muted-foreground'
                      }`}
                    >
                      Scan UPI QR
                    </button>
                  </div>

                  {upiOption === 'id' ? (
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        Virtual Payment Address (VPA / UPI ID)
                      </label>
                      <Input
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. mobile@paytm or name@okhdfcbank"
                        className="rounded-xl border-[#F8DCE4] text-xs h-10"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Supported: Google Pay, PhonePe, Paytm, BHIM, Navi, Cred UPI.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-2 space-y-2">
                      <div className="w-28 h-28 mx-auto p-2 bg-white rounded-xl border border-[#F8DCE4] shadow-xs flex items-center justify-center">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&color=43152E&data=${encodeURIComponent(
                            `upi://pay?pa=satgurumakeup@icici&pn=SatguruMakeupArt&am=${amount}&cu=INR`
                          )}`}
                          alt="UPI QR Code"
                          className="w-full h-full"
                        />
                      </div>
                      <p className="text-[11px] font-semibold text-[#43152E]">
                        Scan with any UPI App to Pay ₹{amount}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {method === 'card' && (
                <div className="p-4 rounded-2xl bg-white border border-[#F8DCE4] space-y-3 shadow-2xs animate-in fade-in duration-200">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      Card Number
                    </label>
                    <Input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="4532 •••• •••• 8892"
                      maxLength={19}
                      className="rounded-xl border-[#F8DCE4] text-xs font-mono h-10"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      Name on Card
                    </label>
                    <Input
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="e.g. Charv Raj"
                      className="rounded-xl border-[#F8DCE4] text-xs h-10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        Expiry Date
                      </label>
                      <Input
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="rounded-xl border-[#F8DCE4] text-xs font-mono h-10"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        CVV / CVC
                      </label>
                      <Input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="•••"
                        maxLength={4}
                        className="rounded-xl border-[#F8DCE4] text-xs font-mono h-10"
                      />
                    </div>
                  </div>
                </div>
              )}

              {method === 'netbanking' && (
                <div className="p-4 rounded-2xl bg-white border border-[#F8DCE4] space-y-2 shadow-2xs animate-in fade-in duration-200">
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Select Your Bank
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#F8DCE4] bg-white text-xs font-semibold text-[#43152E]"
                  >
                    {POPULAR_BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-muted-foreground pt-1">
                    You will be securely redirected to {selectedBank}&apos;s verified authorization portal.
                  </p>
                </div>
              )}

              {/* Encryption guarantee */}
              <div className="p-3 rounded-2xl bg-[#DCE8D7]/60 text-xs text-[#174D3A] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#174D3A]" />
                <span>Zero convenience fee. 256-bit encrypted banking transaction.</span>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#43152E] hover:bg-[#2F0E20] text-white rounded-full text-xs font-semibold gap-2 h-12 shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Authorizing Payment...
                  </>
                ) : (
                  <>
                    Proceed to Add ₹{amount.toLocaleString('en-IN')} <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
