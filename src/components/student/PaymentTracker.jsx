import React from 'react'
import { Payment, CheckCircle, Schedule, Warning, CalendarToday } from '@mui/icons-material'
import 'animate.css'

export default function PaymentTracker({ studentData }) {
  const getPaymentSchedule = () => {
    if (!studentData?.course?.duration || !studentData?.courseStartDate) return [];
    
    const startDate = new Date(studentData.courseStartDate);
    const schedule = [];
    
    for (let i = 0; i < studentData.course.duration; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      // Check if payment is made for this month
      const isPaid = studentData?.payments?.some(payment => {
        const paymentDate = new Date(payment.date);
        return paymentDate.getMonth() === dueDate.getMonth() && 
               paymentDate.getFullYear() === dueDate.getFullYear();
      });

      schedule.push({
        month: i + 1,
        dueDate: dueDate.toISOString().split('T')[0],
        amount: studentData.course.price / studentData.course.duration,
        status: isPaid ? 'paid' : (dueDate < new Date() ? 'overdue' : 'pending'),
        isPaid
      });
    }
    
    return schedule;
  };

  const getNextPaymentDue = () => {
    const schedule = getPaymentSchedule();
    return schedule.find(payment => !payment.isPaid);
  };

  const getTotalPaid = () => {
    return studentData?.payments?.reduce((total, payment) => total + payment.amount, 0) || 0;
  };

  const getPaymentProgress = () => {
    const totalAmount = studentData?.course?.price || 0;
    const paidAmount = getTotalPaid();
    return totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const nextPayment = getNextPaymentDue();
  const paymentSchedule = getPaymentSchedule();
  const paymentProgress = getPaymentProgress();

  return (
    <div className="space-y-6 animate__animated animate__fadeInUp animate__delay-1s">
      {/* Payment Overview Card */}
      <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
        <div className="flex items-center mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] mr-4">
            <Payment className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Payment Overview</h3>
            <p className="text-[#e2e8f0]">Track your course payment progress</p>
          </div>
        </div>

        {/* Payment Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Payment Progress</span>
            <span>{paymentProgress}% Complete</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-[#10b981] to-[#059669] h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${paymentProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-r from-[#10b981]/20 to-[#059669]/20 rounded-xl border border-[#10b981]/30">
            <p className="text-[#10b981] text-sm font-medium">Total Course Fee</p>
            <p className="text-white text-lg font-bold">{formatCurrency(studentData?.course?.price || 0)}</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-[#2563eb]/20 to-[#06b6d4]/20 rounded-xl border border-[#2563eb]/30">
            <p className="text-[#06b6d4] text-sm font-medium">Amount Paid</p>
            <p className="text-white text-lg font-bold">{formatCurrency(getTotalPaid())}</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-[#f97316]/20 to-[#f59e0b]/20 rounded-xl border border-[#f97316]/30">
            <p className="text-[#f97316] text-sm font-medium">Balance</p>
            <p className="text-white text-lg font-bold">
              {formatCurrency((studentData?.course?.price || 0) - getTotalPaid())}
            </p>
          </div>
        </div>
      </div>

      {/* Next Payment Due */}
      {nextPayment && (
        <div className={`bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 ${
          nextPayment.status === 'overdue' ? 'border-red-500/50 bg-red-500/5' : ''
        }`}>
          <div className="flex items-center mb-4">
            <div className={`p-3 rounded-xl mr-4 ${
              nextPayment.status === 'overdue' 
                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                : 'bg-gradient-to-r from-[#f97316] to-[#f59e0b]'
            }`}>
              {nextPayment.status === 'overdue' ? (
                <Warning className="text-white text-xl" />
              ) : (
                <Schedule className="text-white text-xl" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {nextPayment.status === 'overdue' ? 'Payment Overdue' : 'Next Payment Due'}
              </h3>
              <p className="text-[#e2e8f0]">Month {nextPayment.month} installment</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <CalendarToday className="text-[#60a5fa] mr-3" />
              <div>
                <p className="text-[#e2e8f0] text-sm">Due Date</p>
                <p className="text-white font-semibold">{formatDate(nextPayment.dueDate)}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Payment className="text-[#10b981] mr-3" />
              <div>
                <p className="text-[#e2e8f0] text-sm">Amount</p>
                <p className="text-white font-semibold">{formatCurrency(nextPayment.amount)}</p>
              </div>
            </div>
          </div>

          <button className={`w-full mt-4 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
            nextPayment.status === 'overdue'
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/25'
              : 'bg-gradient-to-r from-[#10b981] to-[#059669] hover:shadow-lg hover:shadow-green-500/25'
          } text-white`}>
            {nextPayment.status === 'overdue' ? 'Pay Overdue Amount' : 'Make Payment'}
          </button>
        </div>
      )}

      {/* Payment Schedule */}
      <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center">
          <CalendarToday className="mr-3 text-[#60a5fa]" />
          Payment Schedule
        </h3>

        <div className="space-y-3">
          {paymentSchedule.map((payment, index) => (
            <div 
              key={index}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                payment.status === 'paid' 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : payment.status === 'overdue'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-4 ${
                  payment.status === 'paid' 
                    ? 'bg-green-500' 
                    : payment.status === 'overdue'
                    ? 'bg-red-500'
                    : 'bg-gray-600'
                }`}>
                  {payment.status === 'paid' ? (
                    <CheckCircle className="text-white text-sm" />
                  ) : payment.status === 'overdue' ? (
                    <Warning className="text-white text-sm" />
                  ) : (
                    <Schedule className="text-white text-sm" />
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">Month {payment.month}</p>
                  <p className="text-[#e2e8f0] text-sm">Due: {formatDate(payment.dueDate)}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-white font-semibold">{formatCurrency(payment.amount)}</p>
                <p className={`text-xs font-medium ${
                  payment.status === 'paid' 
                    ? 'text-green-400' 
                    : payment.status === 'overdue'
                    ? 'text-red-400'
                    : 'text-yellow-400'
                }`}>
                  {payment.status === 'paid' ? 'Paid' : payment.status === 'overdue' ? 'Overdue' : 'Pending'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      {studentData?.payments && studentData.payments.length > 0 && (
        <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center">
            <CheckCircle className="mr-3 text-[#10b981]" />
            Payment History
          </h3>

          <div className="space-y-3">
            {studentData.payments.map((payment, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-green-500 mr-4">
                    <CheckCircle className="text-white text-sm" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Payment #{index + 1}</p>
                    <p className="text-[#e2e8f0] text-sm">Paid on: {formatDate(payment.date)}</p>
                    {payment.method && (
                      <p className="text-[#e2e8f0] text-xs">Method: {payment.method}</p>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-white font-semibold">{formatCurrency(payment.amount)}</p>
                  <p className="text-green-400 text-xs font-medium">Completed</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
