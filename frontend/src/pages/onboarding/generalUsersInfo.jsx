import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { auth, database } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';

const GeneralUsersInfo = () => {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState(auth.currentUser?.displayName || '');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [cityState, setCityState] = useState('');
  const [country, setCountry] = useState('India');

  const [primaryLanguage, setPrimaryLanguage] = useState('');
  const [otherLanguages, setOtherLanguages] = useState('');
  const [educationLevel, setEducationLevel] = useState('');

  const [userType, setUserType] = useState(''); 

  const [collegeName, setCollegeName] = useState('');
  const [degree, setDegree] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');

  const [schoolName, setSchoolName] = useState('');
  const [classLevel, setClassLevel] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');

  const [businessType, setBusinessType] = useState('');
  const [businessSize, setBusinessSize] = useState('');
  const [annualTurnoverRange, setAnnualTurnoverRange] = useState('');

  const [householdSize, setHouseholdSize] = useState('');
  const [incomeBracket, setIncomeBracket] = useState('');

  const possibleInterests = ['Grocery', 'Electronics', 'Clothing', 'Food & Restaurants', 'Education', 'Health', 'Beauty', 'Home & Living', 'Jobs', 'Events', 'Travel', 'Services', 'Automotive', 'Other'];
  const [interests, setInterests] = useState([]); 

  const exploreOptionsList = [
    'Find deals', 'Discover businesses', 'Hire services',
    'Find jobs', 'Learn courses', 'Sell products',
    'Network/Partnerships', 'Invest/Franchise', 'Attend events', 'Other'
  ];
  const [exploreOptions, setExploreOptions] = useState([]);
  const [exploreOtherText, setExploreOtherText] = useState('');

  const [devicesUsed, setDevicesUsed] = useState([]);
  const [socialPlatforms, setSocialPlatforms] = useState([]);
  const [preferredCommunication, setPreferredCommunication] = useState([]); 

  const [offersFrequency, setOffersFrequency] = useState(''); 
  const [priceSensitivity, setPriceSensitivity] = useState(''); 
  const [distanceWillingToTravel, setDistanceWillingToTravel] = useState(''); 
  const [preferredPaymentMethods, setPreferredPaymentMethods] = useState([]); 

  const [accessibilityNeeds, setAccessibilityNeeds] = useState(false);
  const [accessibilityDetails, setAccessibilityDetails] = useState('');

  const [preferredTimeOfDay, setPreferredTimeOfDay] = useState([]); 
  const [weeklyAvailability, setWeeklyAvailability] = useState('');

  const [favoriteBrands, setFavoriteBrands] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [socialHandles, setSocialHandles] = useState(''); 

  const [allowNotifications, setAllowNotifications] = useState(true);
  const [consentUsage, setConsentUsage] = useState(false); 

  const [loading, setLoading] = useState(false);

  const toggleArrayValue = (arrSetter, arr, value) => {
    if (arr.includes(value)) {
      arrSetter(arr.filter((a) => a !== value));
    } else {
      arrSetter([...arr, value]);
    }
  };

  const handleSubmit = async () => {
    if (!age || !postalCode || !consentUsage) {
      alert('Please fill Age, Postal Code and provide consent to store data.');
      return;
    }

    setLoading(true);
    try {
      const userDocRef = doc(database, 'Users', auth.currentUser?.uid, 'businessInfo', 'data');

      const payload = {
        fullName: fullName?.trim() || auth.currentUser?.displayName || '',
        age: age?.toString(),
        gender: gender || '',
        postalCode: postalCode?.trim(),
        cityState: cityState?.trim(),
        country: country || 'India',
        primaryLanguage: primaryLanguage?.trim(),
        otherLanguages: otherLanguages?.trim(),
        educationLevel: educationLevel?.trim(),
        userType: userType || '',
        college: userType === 'College Student' ? {
          collegeName: collegeName?.trim(),
          degree: degree?.trim(),
          yearOfStudy: yearOfStudy?.trim()
        } : null,
        school: userType === 'School Student' ? {
          schoolName: schoolName?.trim(),
          classLevel: classLevel?.trim()
        } : null,
        employment: (userType === 'Working Professional') ? {
          companyName: companyName?.trim(),
          jobTitle: jobTitle?.trim(),
          industry: industry?.trim(),
          employmentType: employmentType?.trim(),
          yearsExperience: yearsExperience?.toString()
        } : null,
        businessOwner: (userType === 'Self-Employed') ? {
          businessType: businessType?.trim(),
          businessSize: businessSize?.trim(),
          annualTurnoverRange: annualTurnoverRange?.trim()
        } : null,
        otherDetails: userType === 'Other' ? otherDetails?.trim() : null,

        householdSize: householdSize?.toString(),
        incomeBracket: incomeBracket?.trim(),

        interests: Array.isArray(interests) ? interests : [],
        exploreOptions: Array.isArray(exploreOptions) ? exploreOptions : [],
        exploreOtherText: exploreOtherText?.trim(),

        devicesUsed: Array.isArray(devicesUsed) ? devicesUsed : [],
        socialPlatforms: Array.isArray(socialPlatforms) ? socialPlatforms : [],
        preferredCommunication: Array.isArray(preferredCommunication) ? preferredCommunication : [],

        offersFrequency: offersFrequency || '',
        priceSensitivity: priceSensitivity || '',
        distanceWillingToTravel: distanceWillingToTravel || '',
        preferredPaymentMethods: Array.isArray(preferredPaymentMethods) ? preferredPaymentMethods : [],

        accessibilityNeeds: !!accessibilityNeeds,
        accessibilityDetails: accessibilityDetails?.trim(),

        preferredTimeOfDay: Array.isArray(preferredTimeOfDay) ? preferredTimeOfDay : [],
        weeklyAvailability: weeklyAvailability?.trim(),

        favoriteBrands: favoriteBrands?.trim(),
        hobbies: hobbies?.trim(),
        socialHandles: socialHandles?.trim(),

        allowNotifications: !!allowNotifications,
        consentUsage: !!consentUsage,

        savedAt: new Date().toISOString(),
        userId: auth.currentUser?.uid || null,
        userEmail: auth.currentUser?.email || null
      };

      Object.keys(payload).forEach(k => {
        if (payload[k] === null || payload[k] === undefined) delete payload[k];
      });

      await setDoc(userDocRef, payload, { merge: true });
      alert('Your information has been saved. Thank you!');
      navigate('/home')
    } catch (err) {
      console.error('Error saving user info', err);
      alert('Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto bg-gray-800/60 rounded-xl p-6 border border-gold/20">
        <h1 className="text-3xl font-bold text-center mb-4">Tell Us About Yourself</h1>
        <p className="text-center text-gray-300 mb-6">
          The more details you provide, the better recommendations and personalised results we can show.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full name</label>
            <input value={fullName} onChange={e=>setFullName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Age *</label>
            <input type="number" value={age} onChange={e=>setAge(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" placeholder="e.g., 28" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select value={gender} onChange={e=>setGender(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
              <option value="">Select</option>
              <option value="Male">Male</option><option value="Female">Female</option>
              <option value="Other">Other</option><option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Postal Code *</label>
            <input value={postalCode} onChange={e=>setPostalCode(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" placeholder="e.g., 636008" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City / State</label>
            <input value={cityState} onChange={e=>setCityState(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" placeholder="e.g., Salem, Tamil Nadu" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <input value={country} onChange={e=>setCountry(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" placeholder="Country" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Primary Language</label>
            <input value={primaryLanguage} onChange={e=>setPrimaryLanguage(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" placeholder="e.g., Tamil" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Other Languages</label>
            <input value={otherLanguages} onChange={e=>setOtherLanguages(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" placeholder="comma separated" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Highest Education</label>
            <select value={educationLevel} onChange={e=>setEducationLevel(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
              <option value="">Select</option>
              <option>School (10th/12th)</option>
              <option>Diploma</option>
              <option>Bachelor's</option>
              <option>Master's</option>
              <option>Professional (MBA/MD/Engg)</option>
              <option>Doctorate</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">You are *</label>
          <select value={userType} onChange={e=>setUserType(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
            <option value="">Select</option>
            <option>College Student</option>
            <option>School Student</option>
            <option>Working Professional</option>
            <option>Self-Employed (Business Owner)</option>
            <option>Homemaker</option>
            <option>Retired</option>
            <option>Unemployed</option>
            <option>Other</option>
          </select>
        </div>
        {userType === 'College Student' && (
          <div className="mb-4 bg-gray-900 p-4 rounded">
            <h3 className="font-semibold mb-2">College / Student Details</h3>
            <input value={collegeName} onChange={e=>setCollegeName(e.target.value)} placeholder="College name" className="w-full mb-2 bg-gray-700 border border-gray-600 rounded px-3 py-2" />
            <input value={degree} onChange={e=>setDegree(e.target.value)} placeholder="Degree (e.g., B.Tech CSE)" className="w-full mb-2 bg-gray-700 border border-gray-600 rounded px-3 py-2" />
            <input value={yearOfStudy} onChange={e=>setYearOfStudy(e.target.value)} placeholder="Year of study (e.g., 2nd year)" className="w-full mb-2 bg-gray-700 border border-gray-600 rounded px-3 py-2" />
          </div>
        )}

        {userType === 'School Student' && (
          <div className="mb-4 bg-gray-900 p-4 rounded">
            <h3 className="font-semibold mb-2">School Details</h3>
            <input value={schoolName} onChange={e=>setSchoolName(e.target.value)} placeholder="School name" className="w-full mb-2 bg-gray-700 border border-gray-600 rounded px-3 py-2" />
            <input value={classLevel} onChange={e=>setClassLevel(e.target.value)} placeholder="Class / Grade" className="w-full mb-2 bg-gray-700 border border-gray-600 rounded px-3 py-2" />
          </div>
        )}

        {userType === 'Working Professional' && (
          <div className="mb-4 bg-gray-900 p-4 rounded">
            <h3 className="font-semibold mb-2">Employment Details</h3>
            <input value={companyName} onChange={e=>setCompanyName(e.target.value)} placeholder="Company name" className="w-full mb-2 bg-gray-700 border border-gray-600 rounded px-3 py-2" />
            <input value={jobTitle} onChange={e=>setJobTitle(e.target.value)} placeholder="Job title" className="w-full mb-2 bg-gray-700 border border-gray-600 rounded px-3 py-2" />
            <input value={industry} onChange={e=>setIndustry(e.target.value)} placeholder="Industry (e.g., IT, Retail)" className="w-full mb-2 bg-gray-700 border border-gray-600 rounded px-3 py-2" />
            <select value={employmentType} onChange={e=>setEmploymentType(e.target.value)} className="w-full mb-2 bg-gray-700 border border-gray-600 rounded px-3 py-2">
              <option value="">Employment type</option>
              <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Freelance</option>
            </select>
            <input type="number" value={yearsExperience} onChange={e=>setYearsExperience(e.target.value)} placeholder="Years of experience" className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" />
          </div>
        )}

        {userType === 'Self-Employed (Business Owner)' && (
          <div className="mb-4 bg-gray-900 p-4 rounded">
            <h3 className="font-semibold mb-2">Business Details</h3>
            <input value={businessType} onChange={e=>setBusinessType(e.target.value)} placeholder="Business type (e.g., Kirana, Salon)" className="w-full mb-2 bg-gray-700 border border-gray-600 rounded px-3 py-2" />
            <select value={businessSize} onChange={e=>setBusinessSize(e.target.value)} className="w-full mb-2 bg-gray-700 border border-gray-600 rounded px-3 py-2">
              <option value="">Business size</option>
              <option>Sole proprietor</option><option>2-10 employees</option><option>10-50 employees</option><option>50+</option>
            </select>
            <input value={annualTurnoverRange} onChange={e=>setAnnualTurnoverRange(e.target.value)} placeholder="Annual turnover range (optional)" className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" />
          </div>
        )}

        {userType === 'Other' && (
          <div className="mb-4 bg-gray-900 p-4 rounded">
            <h3 className="font-semibold mb-2">Other Details</h3>
            <textarea value={otherDetails} onChange={e=>setOtherDetails(e.target.value)} placeholder="Please describe..." rows={3} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Household size</label>
            <input value={householdSize} onChange={e=>setHouseholdSize(e.target.value)} placeholder="Number of people" className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Income bracket</label>
            <select value={incomeBracket} onChange={e=>setIncomeBracket(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
              <option value="">Select income bracket</option>
              <option>&lt; ₹1 Lakh</option><option>₹1 - 5 Lakh</option><option>₹5 - 15 Lakh</option><option>₹15 - 50 Lakh</option><option>&gt; ₹50 Lakh</option>
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Interests (choose all that apply)</label>
          <div className="flex flex-wrap gap-2">
            {possibleInterests.map((it) => (
              <button
                key={it}
                onClick={() => toggleArrayValue(setInterests, interests, it)}
                className={`px-3 py-1 rounded ${interests.includes(it) ? 'bg-green-600' : 'bg-gray-700'}`}
                type="button"
              >
                {it}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">What are you trying to explore? (choose all)</label>
          <div className="flex flex-wrap gap-2">
            {exploreOptionsList.map(opt => (
              <button key={opt} onClick={() => toggleArrayValue(setExploreOptions, exploreOptions, opt)} className={`px-3 py-1 rounded ${exploreOptions.includes(opt)? 'bg-green-600' : 'bg-gray-700'}`} type="button">
                {opt}
              </button>
            ))}
          </div>
          {exploreOptions.includes('Other') && (
            <input value={exploreOtherText} onChange={e=>setExploreOtherText(e.target.value)} placeholder="Please specify other exploration goals" className="mt-2 w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" />
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Devices you use</label>
            <div className="flex gap-2 flex-wrap">
              {['Mobile','Desktop','Tablet'].map(d => (
                <button key={d} onClick={() => toggleArrayValue(setDevicesUsed, devicesUsed, d)} type="button" className={`px-3 py-1 rounded ${devicesUsed.includes(d)? 'bg-green-600':'bg-gray-700'}`}>{d}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Social platforms you use</label>
            <div className="flex gap-2 flex-wrap">
              {['WhatsApp','Instagram','Facebook','YouTube','LinkedIn','Telegram','X'].map(p => (
                <button key={p} onClick={() => toggleArrayValue(setSocialPlatforms, socialPlatforms, p)} type="button" className={`px-3 py-1 rounded ${socialPlatforms.includes(p)? 'bg-green-600':'bg-gray-700'}`}>{p}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Preferred communication channels</label>
            <div className="flex gap-2 flex-wrap">
              {['Push','SMS','Email','WhatsApp','In-app'].map(c => (
                <button key={c} onClick={() => toggleArrayValue(setPreferredCommunication, preferredCommunication, c)} type="button" className={`px-3 py-1 rounded ${preferredCommunication.includes(c)? 'bg-green-600':'bg-gray-700'}`}>{c}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Offers frequency</label>
            <select value={offersFrequency} onChange={e=>setOffersFrequency(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
              <option value="">Select</option>
              <option>Daily</option><option>Weekly</option><option>Monthly</option><option>Occasionally</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price sensitivity</label>
            <select value={priceSensitivity} onChange={e=>setPriceSensitivity(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
              <option value="">Select</option>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Distance willing to travel</label>
            <select value={distanceWillingToTravel} onChange={e=>setDistanceWillingToTravel(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
              <option value="">Select</option>
              <option>Within city</option><option>Up to 5 km</option><option>Up to 10 km</option><option>Up to 25 km</option><option>Any distance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Preferred payment methods</label>
            <div className="flex gap-2 flex-wrap">
              {['Cash','Card','UPI','Wallet','EMI'].map(pm => (
                <button key={pm} onClick={() => toggleArrayValue(setPreferredPaymentMethods, preferredPaymentMethods, pm)} type="button" className={`px-3 py-1 rounded ${preferredPaymentMethods.includes(pm)? 'bg-green-600':'bg-gray-700'}`}>{pm}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="mb-4">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={accessibilityNeeds} onChange={e=>setAccessibilityNeeds(e.target.checked)} className="form-checkbox" />
            <span className="ml-2">I have accessibility needs</span>
          </label>
          {accessibilityNeeds && (
            <textarea value={accessibilityDetails} onChange={e=>setAccessibilityDetails(e.target.value)} placeholder="Please describe accessibility requirements" rows={2} className="w-full mt-2 bg-gray-700 border border-gray-600 rounded px-3 py-2" />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Preferred time of day</label>
            <div className="flex gap-2 flex-wrap">
              {['Morning','Afternoon','Evening','Night'].map(t => (
                <button key={t} onClick={() => toggleArrayValue(setPreferredTimeOfDay, preferredTimeOfDay, t)} type="button" className={`px-3 py-1 rounded ${preferredTimeOfDay.includes(t)? 'bg-green-600':'bg-gray-700'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Weekly availability</label>
            <select value={weeklyAvailability} onChange={e=>setWeeklyAvailability(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
              <option value="">Select</option>
              <option>Weekdays</option><option>Weekends</option><option>Flexible</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Favourite brands / keywords</label>
          <input value={favoriteBrands} onChange={e=>setFavoriteBrands(e.target.value)} placeholder="e.g., Samsung, Big Bazaar" className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Hobbies & interests (comma separated)</label>
          <input value={hobbies} onChange={e=>setHobbies(e.target.value)} placeholder="e.g., cooking, photography" className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Social handles (optional)</label>
          <input value={socialHandles} onChange={e=>setSocialHandles(e.target.value)} placeholder="@instagram, @twitter, phone" className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" />
        </div>
        <div className="mb-6">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={allowNotifications} onChange={e=>setAllowNotifications(e.target.checked)} />
            <span className="ml-2">Allow notifications / offers</span>
          </label>
          <div className="mt-3">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={consentUsage} onChange={e=>setConsentUsage(e.target.checked)} />
              <span className="ml-2 text-sm">I consent to storing and using my data for personalized recommendations (required)</span>
            </label>
          </div>
        </div>
        <div className="mb-2">
          <button onClick={handleSubmit} disabled={loading} className="w-full bg-gold hover:bg-gold-dark text-white font-bold py-3 rounded-lg">
            {loading ? 'Saving...' : 'Save My Info'}
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-2">We store this information securely and use it to personalize suggestions. You can update or delete your data anytime from profile settings.</p>
      </div>
    </div>
  );
};

export default GeneralUsersInfo;
