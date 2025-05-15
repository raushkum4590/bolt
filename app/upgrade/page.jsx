"use client";

import React, { useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { UserDetailContext } from '@/context/UserDetailContext';
import { ArrowLeft, ArrowRight, Bot, CheckCircle, CreditCard, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function UpgradePage() {
  const router = useRouter();
  const { userDetail } = useContext(UserDetailContext);
  const [selectedPlan, setSelectedPlan] = useState('pro'); // 'pro' or 'premium'
  const [paymentStep, setPaymentStep] = useState('plan'); // 'plan', 'details', 'confirmation'
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [loading, setLoading] = useState(false);

  const plans = {
    pro: {
      name: 'Pro Plan',
      price: '$9.99',
      tokens: '10,000',
      color: 'blue',
      features: [
        'Advanced AI code assistance',
        '10,000 tokens per month',
        'Workspace history & saving',
        'Priority support'
      ]
    },
    premium: {
      name: 'Premium Plan',
      price: '$19.99',
      tokens: 'Unlimited',
      color: 'purple',
      features: [
        'Advanced AI code assistance',
        'Unlimited tokens',
        'Workspace history & saving',
        'Priority support',
        'Early access to new features'
      ]
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProceedToPayment = () => {
    setPaymentStep('details');
  };

  const handleSubmitPayment = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      setPaymentStep('confirmation');
    }, 2000);
  };

  const handleReturnToWorkspace = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="border-b border-gray-800 bg-black/30 backdrop-blur-sm p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-semibold text-white">AI Web Assistant</h1>
          </div>
          {userDetail && (
            <div className="flex items-center gap-3">
              <span className="text-gray-300 text-sm">{userDetail.name}</span>
              {userDetail.picture && (
                <Image 
                  src={userDetail.picture} 
                  alt="User" 
                  width={32} 
                  height={32} 
                  className="rounded-full border border-gray-700" 
                />
              )}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 container mx-auto py-8 px-4">
        <Button 
          variant="outline" 
          className="mb-8 border-gray-700 hover:bg-gray-800 text-gray-300 flex items-center gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeft size={16} />
          Back
        </Button>

        {paymentStep === 'plan' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold text-white mb-2">Choose your plan</h2>
            <p className="text-gray-400 mb-8">Select the plan that works best for you and your development needs.</p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Pro Plan */}
              <div 
                className={`border rounded-lg p-6 transition-all cursor-pointer ${
                  selectedPlan === 'pro' 
                    ? 'border-blue-500 bg-blue-900/20' 
                    : 'border-gray-700 bg-gray-800/50 hover:border-blue-500/50'
                }`}
                onClick={() => setSelectedPlan('pro')}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-blue-400 text-lg">Pro Plan</h3>
                    <p className="text-gray-300">{plans.pro.tokens} tokens per month</p>
                  </div>
                  <div className="h-6 w-6 rounded-full border-2 flex items-center justify-center">
                    {selectedPlan === 'pro' && (
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    )}
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-4">{plans.pro.price}<span className="text-sm font-normal text-gray-400"> / month</span></div>
                <ul className="space-y-2">
                  {plans.pro.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-blue-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Premium Plan */}
              <div 
                className={`border rounded-lg p-6 transition-all cursor-pointer ${
                  selectedPlan === 'premium' 
                    ? 'border-purple-500 bg-purple-900/20' 
                    : 'border-gray-700 bg-gray-800/50 hover:border-purple-500/50'
                }`}
                onClick={() => setSelectedPlan('premium')}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-purple-400 text-lg">Premium Plan</h3>
                      <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-xs px-2 py-0.5 rounded-full text-white">Best Value</span>
                    </div>
                    <p className="text-gray-300">{plans.premium.tokens} tokens</p>
                  </div>
                  <div className="h-6 w-6 rounded-full border-2 flex items-center justify-center">
                    {selectedPlan === 'premium' && (
                      <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                    )}
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-4">{plans.premium.price}<span className="text-sm font-normal text-gray-400"> / month</span></div>
                <ul className="space-y-2">
                  {plans.premium.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-purple-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Button 
              className={`w-full py-6 text-white px-6 ${
                selectedPlan === 'pro' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
              }`}
              onClick={handleProceedToPayment}
            >
              <span className="flex items-center gap-2">
                Continue to Payment
                <ArrowRight size={16} />
              </span>
            </Button>
          </div>
        )}

        {paymentStep === 'details' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-white mb-2">Payment Details</h2>
            <p className="text-gray-400 mb-8">
              You're subscribing to the <span className={selectedPlan === 'pro' ? 'text-blue-400' : 'text-purple-400'}>
                {selectedPlan === 'pro' ? plans.pro.name : plans.premium.name}
              </span> at {selectedPlan === 'pro' ? plans.pro.price : plans.premium.price}/month
            </p>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8">
              <form onSubmit={handleSubmitPayment}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg text-gray-200 font-medium">Card Information</h3>
                  <div className="flex gap-2">
                    <div className="w-8 h-5 bg-gray-700 rounded"></div>
                    <div className="w-8 h-5 bg-gray-700 rounded"></div>
                    <div className="w-8 h-5 bg-gray-700 rounded"></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:border-blue-500"
                      placeholder="Name on card"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:border-blue-500"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                      <CreditCard className="absolute right-3 top-3 h-5 w-5 text-gray-500" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:border-blue-500"
                        placeholder="MM / YY"
                        maxLength={7}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Security Code</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:border-blue-500"
                          placeholder="CVV"
                          maxLength={4}
                        />
                        <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center mt-8 mb-4">
                  <Lock className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-400">Your payment information is encrypted and secure</span>
                </div>
                
                <Button 
                  type="submit"
                  className={`w-full py-6 text-white ${
                    selectedPlan === 'pro' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full"></div>
                      Processing...
                    </span>
                  ) : (
                    <span>Complete Subscription</span>
                  )}
                </Button>
              </form>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full border-gray-700 hover:bg-gray-800 text-gray-300"
              onClick={() => setPaymentStep('plan')}
            >
              Back to Plans
            </Button>
          </div>
        )}

        {paymentStep === 'confirmation' && (
          <div className="max-w-xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle size={40} className="text-green-400" />
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-white mb-2">Payment Successful!</h2>
            <p className="text-gray-400 mb-8">
              You've successfully subscribed to the {selectedPlan === 'pro' ? plans.pro.name : plans.premium.name}.
              Your new token allocation is now available.
            </p>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8">
              <div className="flex flex-col items-center">
                <p className="text-gray-300 mb-2">Your {selectedPlan === 'pro' ? 'Pro' : 'Premium'} subscription includes:</p>
                <h3 className="text-3xl font-bold text-white mb-1">
                  {selectedPlan === 'pro' ? plans.pro.tokens : plans.premium.tokens} tokens
                </h3>
                <p className="text-gray-400 mb-4">Available immediately</p>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6"
                  onClick={handleReturnToWorkspace}
                >
                  Return to Workspace
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}