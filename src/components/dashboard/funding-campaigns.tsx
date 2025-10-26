import { Heart, DollarSign, CreditCard, QrCode } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Campaign {
  id: string;
  title: string;
  description: string;
  raised: number;
  goal: number;
  backers: number;
  image: string;
  daysLeft: number;
}

export function FundingCampaigns() {
  const [selectedAmount, setSelectedAmount] = useState<string>("500");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("upi");
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    try {
      // lazy load from data layer
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { getCampaigns } = require("@/lib/data");
      return getCampaigns();
    } catch (e) {
      return [];
    }
  });

  const handleAmountChange = (value: string) => {
    setSelectedAmount(value);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setCustomAmount(value);
      setSelectedAmount("");
    }
  };

  const getFinalAmount = () => {
    return customAmount || selectedAmount;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Crowdfunding Campaigns</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {campaigns.map((campaign) => {
            const percentage = Math.round((campaign.raised / campaign.goal) * 100);
            
            return (
              <div
                key={campaign.id}
                className="border rounded-lg overflow-hidden card-hover"
              >
                <div
                  className="h-36 bg-cover bg-center"
                  style={{ backgroundImage: `url(${campaign.image})` }}
                ></div>
                <div className="p-3">
                  <h3 className="font-medium">{campaign.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {campaign.description}
                  </p>
                  
                  <div className="mt-3">
                    <div className="mb-1 text-xs flex justify-between">
                      <span>₹{campaign.raised.toLocaleString()}</span>
                      <span>{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                  
                  <div className="mt-3 flex justify-between items-center">
                    <div className="text-xs">
                      <span className="font-medium">{campaign.backers} backers</span>
                      <span className="mx-2">•</span>
                      <span>{campaign.daysLeft} days left</span>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="h-8">
                          <Heart className="h-3 w-3 mr-1" />
                          Donate
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Donate to {campaign.title}</DialogTitle>
                          <DialogDescription>
                            Choose your donation amount and payment method
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Select Amount</Label>
                              <RadioGroup
                                value={selectedAmount}
                                onValueChange={handleAmountChange}
                                className="grid grid-cols-3 gap-2"
                              >
                                <div>
                                  <RadioGroupItem
                                    value="100"
                                    id="r100"
                                    className="peer sr-only"
                                  />
                                  <Label
                                    htmlFor="r100"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                  >
                                    <span>₹100</span>
                                  </Label>
                                </div>
                                <div>
                                  <RadioGroupItem
                                    value="500"
                                    id="r500"
                                    className="peer sr-only"
                                  />
                                  <Label
                                    htmlFor="r500"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                  >
                                    <span>₹500</span>
                                  </Label>
                                </div>
                                <div>
                                  <RadioGroupItem
                                    value="1000"
                                    id="r1000"
                                    className="peer sr-only"
                                  />
                                  <Label
                                    htmlFor="r1000"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                  >
                                    <span>₹1000</span>
                                  </Label>
                                </div>
                              </RadioGroup>
                              <div className="mt-2">
                                <Label htmlFor="custom-amount">Custom Amount</Label>
                                <Input
                                  id="custom-amount"
                                  placeholder="Enter amount"
                                  value={customAmount}
                                  onChange={handleCustomAmountChange}
                                  className="mt-1"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Payment Method</Label>
                              <RadioGroup
                                value={paymentMethod}
                                onValueChange={setPaymentMethod}
                                className="grid grid-cols-2 gap-2"
                              >
                                <div>
                                  <RadioGroupItem
                                    value="upi"
                                    id="upi"
                                    className="peer sr-only"
                                  />
                                  <Label
                                    htmlFor="upi"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                  >
                                    <QrCode className="mb-2 h-6 w-6" />
                                    <span>UPI</span>
                                  </Label>
                                </div>
                                <div>
                                  <RadioGroupItem
                                    value="bank"
                                    id="bank"
                                    className="peer sr-only"
                                  />
                                  <Label
                                    htmlFor="bank"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                  >
                                    <CreditCard className="mb-2 h-6 w-6" />
                                    <span>Bank Transfer</span>
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>

                            {paymentMethod === "upi" && (
                              <div className="mt-4 p-4 border rounded-lg">
                                <div className="text-center mb-4">
                                  <div className="text-sm font-medium mb-2">Scan QR Code to Pay</div>
                                  <div className="text-2xl font-bold mb-2">₹{getFinalAmount()}</div>
                                  <div className="text-xs text-muted-foreground">
                                    UPI ID: pmcares@sbi
                                  </div>
                                </div>
                                <div className="flex justify-center">
                                  <img
                                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=pmcares@sbi&pn=PM%20Cares%20Fund&am={getFinalAmount()}"
                                    alt="UPI QR Code"
                                    className="w-48 h-48"
                                  />
                                </div>
                              </div>
                            )}

                            {paymentMethod === "bank" && (
                              <div className="mt-4 p-4 border rounded-lg">
                                <div className="space-y-2">
                                  <div className="text-sm font-medium">Bank Details</div>
                                  <div className="text-xs space-y-1">
                                    <p><span className="font-medium">Account Name:</span> PM CARES Fund</p>
                                    <p><span className="font-medium">Account Number:</span> 10053939205</p>
                                    <p><span className="font-medium">Bank:</span> State Bank of India</p>
                                    <p><span className="font-medium">IFSC:</span> SBIN0000691</p>
                                    <p><span className="font-medium">Amount:</span> ₹{getFinalAmount()}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-end">
                            <Button
                              onClick={() => {
                                const amount = Number(getFinalAmount() || 0);
                                if (!amount || amount <= 0) return;
                                try {
                                  // eslint-disable-next-line @typescript-eslint/no-var-requires
                                  const { donateToCampaign, getCampaigns } = require("@/lib/data");
                                  donateToCampaign(campaign.id, amount);
                                  setCampaigns(getCampaigns());
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                            >
                              Confirm Donate
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
