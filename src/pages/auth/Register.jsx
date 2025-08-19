import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Country, State, City } from 'country-state-city';
import Step1PersonalInfo from '../../components/auth/steps/Step1PersonalInfo';
import Step2EmailPassword from '../../components/auth/steps/Step2EmailPassword';
import Step3LearningSetup from '../../components/auth/steps/Step3LearningSetup';
import Step4AdditionalInfo from '../../components/auth/steps/Step4AdditionalInfo';
import Step5CourseSelection from '../../components/auth/steps/Step5CourseSelection';
import Step6TermsConditions from '../../components/auth/steps/Step6TermsConditions';
import api from '../../api/axios';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  const [loadSubmitBtn, setLoadSubmitBtn] = useState(false)
  
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    country: '',
    state: '',
    city: '',
    gender: '',
    dateOfBirth: '',
    
    // Step 2: Email and Password
    email: '',
    password: '',
    confirmPassword: '',
    
    // Step 3: Learning Setup
    learningMode: '', // online or offline
    hasLaptop: '', // yes or no
    laptopModel: '',
    laptopRam: '',
    
    // Step 4: Internship and Accommodation
    internshipInterest: '', // yes or no
    needAccommodation: '', // yes or no
    needTshirt: '', // yes or no
    
    // Step 5: Course Selection
    selectedCourse: '',
    roomType: '',
    
    // Step 6: Terms Agreement
    agreeToTerms: false
  });

  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const { setstudentData } = useAuth()

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  useEffect(() => {
    if (formData.country) {
      const countryStates = State.getStatesOfCountry(formData.country);
      setStates(countryStates);
      setCities([]);
      setFormData(prev => ({ ...prev, state: '', city: '' }));
    }
  }, [formData.country]);

  useEffect(() => {
    if (formData.state) {
      const stateCities = City.getCitiesOfState(formData.country, formData.state);
      setCities(stateCities);
      setFormData(prev => ({ ...prev, city: '' }));
    }
  }, [formData.state, formData.country]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
        if (!formData.address) newErrors.address = 'Address is required';
        if (!formData.country) newErrors.country = 'Country is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        break;
        
      case 2:
        if (!formData.email) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Email is invalid';
        }
        
        if (!formData.password) {
          newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
          newErrors.password = 'Password must contain uppercase, lowercase, and number';
        }
        
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;
        
      case 3:
        if (!formData.learningMode) newErrors.learningMode = 'Learning mode is required';
        if (!formData.hasLaptop) newErrors.hasLaptop = 'Laptop availability is required';
        if (formData.hasLaptop === 'yes' && !formData.laptopModel) {
          newErrors.laptopModel = 'Laptop model is required';
        }
        if (formData.hasLaptop === 'yes' && !formData.laptopRam) {
          newErrors.laptopRam = 'RAM information is required';
        }
        break;
        
      case 4:
        if (!formData.internshipInterest) newErrors.internshipInterest = 'Internship preference is required';
        if (!formData.needAccommodation) newErrors.needAccommodation = 'Accommodation preference is required';
        if (!formData.needTshirt) newErrors.needTshirt = 'T-shirt preference is required';
        break;
        
      case 5:
        if (!formData.selectedCourse) newErrors.selectedCourse = 'Course selection is required';
        if (formData.needAccommodation === 'yes' && !formData.roomType) {
          newErrors.roomType = 'Room type is required';
        }
        break;
        
      case 6:
        if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
       setLoadSubmitBtn(true)
      try {
        const response = await api.post("/auth/register", formData)
        if(response?.success){
          toast.success(response?.message)
          setstudentData(response?.data?.user)
          Cookies.set('token', response?.data?.token);
          window.location.href = "/student"
        return
        }
      } catch (error) {
        console.error('Registration error:', error);
        toast.error(error.message)
      }
      finally{
        setLoadSubmitBtn(false)
      }
    }
  };

  const closeModal = () => {
    navigate('/');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1PersonalInfo formData={formData} handleChange={handleChange} errors={errors} countries={countries} states={states} cities={cities} />;
      case 2:
        return <Step2EmailPassword formData={formData} handleChange={handleChange} errors={errors} />;
      case 3:
        return <Step3LearningSetup formData={formData} handleChange={handleChange} errors={errors} />;
      case 4:
        return <Step4AdditionalInfo formData={formData} handleChange={handleChange} errors={errors} />;
      case 5:
        return <Step5CourseSelection formData={formData} handleChange={handleChange} errors={errors} />;
      case 6:
        return <Step6TermsConditions formData={formData} loadSubmitBtn={loadSubmitBtn} handleChange={handleChange} errors={errors} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-30"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              backgroundColor: ['#2563eb', '#06b6d4', '#7c3aed', '#ec4899'][Math.floor(Math.random() * 4)],
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animation: `floatParticlesW ${4 + Math.random() * 4}s ease-in-out infinite`
            }}
          />
        ))}
      </div>

      {/* Registration Card */}
      <div className="relative w-full max-w-2xl">
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-2 right-2 transition-transform hover:rotate-90 duration-300  z-10 w-10 h-10 text-white rounded-full flex items-center justify-center "
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2563eb] via-[#06b6d4] to-[#7c3aed] rounded-2xl blur-xl opacity-20 animate-pulse"></div>
        
        {/* Main Card */}
        <div className="relative bg-gradient-to-br from-black/40 via-[#1a1a2e]/60 to-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gradient-primary mb-2">Join HighScore Tech</h1>
            <p className="text-gray-300">Complete your registration to start your journey</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#2563eb] to-[#06b6d4] h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-6 py-2 bg-gray-600/50 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous</span>
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white rounded-lg hover:shadow-lg hover:shadow-[#2563eb]/25 transition-all"
              >
                <span>Next</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loadSubmitBtn}
                className="flex items-center space-x-2 px-8 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/25 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{loadSubmitBtn ? "Loading..." : "Complete Registration"}</span>
              </button>
            )}
          </div>

          {/* Login Link */}
          <div className="text-center mt-6 pt-4 border-t border-white/10">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-[#06b6d4] hover:text-[#2563eb] font-medium transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
