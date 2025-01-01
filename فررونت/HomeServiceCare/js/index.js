

let baseURL = "https://localhost:7137"

let mark = document.getElementById("mark")
let mycar = document.getElementById("mycar")
let myCarItems = document.getElementById("my-car-items")
let totalItems = document.getElementById("total-items")
let totalprices = document.getElementById("total-prices")

let home = document.getElementById("home")
let servicesSection = document.getElementById("services")
let login = document.getElementById("login")
let register = document.getElementById("register")
let navLogin = document.getElementById("nav-login")
let navLogout = document.getElementById("nav-logout")
let navRegister = document.getElementById("nav-register")
let fname = document.getElementById("FName")
let lname = document.getElementById("LName")
let email = document.getElementById("email")
let phone = document.getElementById("phone")
let password = document.getElementById("password")
let logemail = document.getElementById("logemail")
let logpass = document.getElementById("logpass")
let errData = document.getElementById("errorData")
let errAcc = document.getElementById("errorAcc")
let categoryDetails = document.getElementById("category-details")
let SubCatContainer = document.getElementById("SubCategory-details");
let technicianApp = document.getElementById("technician");
let techProfile = document.getElementById("tech-profile");
let userProfile = document.getElementById("user-profile");
let technicianPage=document.getElementById("technician-profile");
let payment=document.getElementById("payment");
let ratingSection=document.getElementById("ratingSection");




let reservationData = [];
let PrevusreservationData = [];
let categories = [];

let userRole=''

checkLogin()

const container = document.getElementById("categories");

// Fetch data from the API
async function GetAllCategories() {
    try {
        const response = await fetch(`${baseURL}/api/Category/GetAll`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const services = await response.json();
        console.log(services.data);


        // Clear container before rendering (optional, based on your logic)
        container.innerHTML = "";

        // Loop through the array and create cards dynamically
        services.data.collection.forEach(service => {
            const card = `
        <div class="col-lg-4 col-md-6">
          <div class="card text-center border-0 shadow h-100">
            <div class="card-body p-4">
              <div class="mb-3">
                <i class="fas ${service.icon} fa-4x  text-primary mb-2"></i>
              </div>
              <h4 class="card-title fw-bold mb-3">${service.name}</h4>
              <p class="card-text text-muted mb-3">${service.description}</p>
              <button class="btn btn-outline-primary" onClick="GetCategoryDetails('${service.id}')">Services</button>
            </div>
          </div>
        </div>
      `;
            container.innerHTML += card;
        });
    } catch (error) {
        console.error("Error fetching services:", error);
        container.innerHTML = `<p class="text-danger">Failed to load services. Please try again later.</p>`;
    }
}

// Call the function
GetAllCategories();






function checkLogin() {

    if (localStorage.getItem("token")) {

        decodeToken(localStorage.getItem("token"))
        navLogout.classList.remove("d-none")
        navLogin.classList.add("d-none")
        navRegister.classList.add("d-none")
    }else{
        navLogout.classList.add("d-none")
        navLogin.classList.remove("d-none")
        navRegister.classList.remove("d-none")
    }
}



 let selectedTechnicians=[]

 let totalPrice = 0;

// عرض العناصر المختارة
function renderSelectedItems() {
    totalPrice=0
  const selectedItemsContainer = document.getElementById("selectedItems");
  selectedItemsContainer.innerHTML = "";

  if(selectedTechnicians.length>0){
     selectedTechnicians.forEach((technician) => {
    const itemHTML = `
      <div class="list-group-item d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
          <img src="./assets/pngtree-maintenance-technician-cartoon-png-image_14887469 (1).png" alt="${technician.name}" width="100px" class="me-3 ">
          <div>
            <p class="mb-0"><strong>${technician.technicianName}</strong></p>
            <p class="mb-0 text-muted">Phone: ${technician.technicianNumber}</p>
            <p class="mb-0 text-muted">Date: ${(new Date(technician.visit.startTime)).toLocaleString().split(',')[0]}</p>
            <p class="mb-0 text-muted">Time: ${(new Date(technician.visit.startTime)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${(new Date(technician.visit.endTime)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
        <div>
          <p class="mb-0 fw-bold">${technician.visit.price} SAR</p>
          <button class="btn btn-danger btn-sm remove-item" onclick="removeItem('${technician.technicianID}')">Remove</button>
        </div>
      </div>
    `;
    selectedItemsContainer.innerHTML += itemHTML;

    // تحديث السعر الإجمالي
    totalPrice= technician.visit.price+totalPrice;
  });
  }
  else{

    const itemHTML = `<p> You have not booked a visit yet </p>`;
    selectedItemsContainer.innerHTML += itemHTML;

  }
 

  document.getElementById("totalPrice").textContent = totalPrice;
}

// إزالة عنصر
function removeItem(id) {
  const index = selectedTechnicians.findIndex((tech) => tech.technicianID === id);
  if (index > -1) {
    totalPrice =totalPrice- selectedTechnicians[index].visit.price;
    selectedTechnicians.splice(index, 1);
if (selectedTechnicians.length < 1) {
    const bookBTN = document.getElementById("confirm-booking");

    // تعطيل الزر
    bookBTN.setAttribute("disabled", "true");
} else {
    // تمكين الزر إذا كان هناك فنيون مختارون
    const bookBTN = document.getElementById("confirm-booking");
    bookBTN.removeAttribute("disabled");
}
    renderSelectedItems();
  }
}



async function confirmBooking() {


    if (selectedTechnicians.length === 0) {
      alert("No items selected.");
      return;
    }
  
    try {
      // تحضير بيانات الحجز
      const reservations =[];

      selectedTechnicians.forEach((v)=>{
        let vis={
            visitId:v.visit.id
        }

        reservations.push(vis)
      })
  
      // الحصول على التوكين من localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Token not found. Please log in again.");
        return;
      }
  
      // إرسال الطلب إلى الـ API
      const response = await fetch("https://localhost:7137/api/reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // إضافة التوكين إلى الهيدر
        },
        body: JSON.stringify(reservations), // تحويل البيانات إلى JSON
      });
  
      if (response.ok) {
        const result = await response.json(); // استجابة الخادم إذا لزم
        alert("Booking confirmed successfully!");

        selectedTechnicians=[]
        gotoHome()
        console.log("Response from server:", result);
      } else {
        const error = await response.json();
        alert("Failed to confirm booking: " + error.message);
        console.error("Error from server:", error);
      }
    } catch (error) {
      alert("An error occurred while confirming booking.");
      console.error("Network error:", error);
    }
  }
  
  
  /************************************ payment ************************************* */

  document.getElementById('confirm-booking').addEventListener('click', function (e) {
    e.preventDefault();

    const amount=document.getElementById("amount")

    amount.value=totalPrice

    gotoPayment()
 // عناصر الفورم
const fields = {
    fullName: /.+/, // أي نص غير فارغ
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // صيغة البريد الإلكتروني
    cardNumber: /^\d{16}$/, // رقم البطاقة (16 رقماً)
    expiryDate: /^(0[1-9]|1[0-2])\/\d{2}$/, // التاريخ بصيغة MM/YY
    cvv: /^\d{3}$/, // كود CVV (3 أرقام)
    amount: /^[1-9]\d*$/ // مبلغ صحيح أكبر من صفر
};

// دالة التحقق من الحقل الفردي
function validateField(input, pattern) {
    const value = input.value.trim();
    const isValid = pattern.test(value);

    if (isValid) {
        input.classList.add('is-valid');
        input.classList.remove('is-invalid');
    } else {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
    }

    return isValid;
}

// التحقق من جميع الحقول
function validateForm() {
    const isFormValid = Object.entries(fields).every(([id, pattern]) => {
        const input = document.getElementById(id);
        return validateField(input, pattern);
    });

    document.getElementById('submit').disabled = !isFormValid;
}

// إضافة الأحداث إلى الحقول
Object.entries(fields).forEach(([id, pattern]) => {
    const input = document.getElementById(id);

    // التحقق عند إدخال النص
    input.addEventListener('input', () => {
        validateField(input, pattern);
        validateForm();
    });

    // التحقق عند فقدان التركيز
    input.addEventListener('blur', () => {
        validateField(input, pattern);
    });
});

// تعطيل الإرسال الافتراضي للنموذج
document.getElementById('paymentForm').addEventListener('submit', (event) => {
    event.preventDefault();

    confirmBooking()
});

  });




async function gotoCar() {

if (selectedTechnicians.length < 1) {
    const bookBTN = document.getElementById("confirm-booking");

    // تعطيل الزر
    bookBTN.setAttribute("disabled", "true");
} else {
    // تمكين الزر إذا كان هناك فنيون مختارون
    const bookBTN = document.getElementById("confirm-booking");
    bookBTN.removeAttribute("disabled");
}
    renderSelectedItems()
    try {
        await getReservationsForUser(); // انتظر جلب البيانات قبل الانتقال
    servicesSection.classList.add("d-none")
    home.classList.add("d-none")
    mycar.classList.remove("d-none")
    register.classList.add("d-none")
    login.classList.add("d-none")
    categoryDetails.classList.add("d-none")
    SubCatContainer.classList.add("d-none")
    technicianApp.classList.add("d-none")
    technicianPage.classList.add("d-none")
    payment.classList.add("d-none")
    ratingSection.classList.add("d-none")

        displayReservationDataForUser(); // بعد التبديل، اعرض البيانات في الجدول
    } catch (error) {
        console.error("Error in gotoUserProfile:", error);
    }
}

function gotoHome() {

    mycar.classList.add("d-none")
    home.classList.remove("d-none")
    servicesSection.classList.remove("d-none")
    register.classList.add("d-none")
    login.classList.add("d-none")
    categoryDetails.classList.add("d-none")
    SubCatContainer.classList.add("d-none")
    technicianApp.classList.add("d-none")
    technicianPage.classList.add("d-none")
    payment.classList.add("d-none")
    ratingSection.classList.add("d-none")
}

function gotoLogin() {
    home.classList.add("d-none")
    mycar.classList.add("d-none")
    register.classList.add("d-none")
    servicesSection.classList.add("d-none")
    login.classList.remove("d-none")
    categoryDetails.classList.add("d-none")
    SubCatContainer.classList.add("d-none")
    technicianApp.classList.add("d-none")
    technicianPage.classList.add("d-none")
    payment.classList.add("d-none")
    ratingSection.classList.add("d-none")
}

function gotoRegister() {
    getAllSubCategories()
    home.classList.add("d-none")
    mycar.classList.add("d-none")
    login.classList.add("d-none")
    register.classList.remove("d-none")
    servicesSection.classList.add("d-none")
    categoryDetails.classList.add("d-none")
    SubCatContainer.classList.add("d-none")
    technicianApp.classList.add("d-none")
    technicianPage.classList.add("d-none")
    payment.classList.add("d-none")
    ratingSection.classList.add("d-none")
}

function gotoCategory() {
    categoryDetails.classList.remove("d-none")
    home.classList.add("d-none")
    mycar.classList.add("d-none")
    login.classList.add("d-none")
    register.classList.add("d-none")
    servicesSection.classList.add("d-none")
    SubCatContainer.classList.add("d-none")
    technicianApp.classList.add("d-none")
    technicianPage.classList.add("d-none")
    payment.classList.add("d-none")
    ratingSection.classList.add("d-none")
}

function gotoSubCategory() {
    categoryDetails.classList.add("d-none")
    home.classList.add("d-none")
    mycar.classList.add("d-none")
    login.classList.add("d-none")
    register.classList.add("d-none")
    servicesSection.classList.add("d-none")
    SubCatContainer.classList.remove("d-none")
    technicianApp.classList.add("d-none")
    technicianPage.classList.add("d-none")
    payment.classList.add("d-none")
    ratingSection.classList.add("d-none")
}

function gotoTechnicianApp() {
    categoryDetails.classList.add("d-none")
    home.classList.add("d-none")
    mycar.classList.add("d-none")
    login.classList.add("d-none")
    register.classList.add("d-none")
    servicesSection.classList.add("d-none")
    SubCatContainer.classList.add("d-none")
    technicianApp.classList.remove("d-none")
    technicianPage.classList.add("d-none")
    payment.classList.add("d-none")
    ratingSection.classList.add("d-none")
}

function gotoPayment() {
    categoryDetails.classList.add("d-none")
    home.classList.add("d-none")
    mycar.classList.add("d-none")
    login.classList.add("d-none")
    register.classList.add("d-none")
    servicesSection.classList.add("d-none")
    SubCatContainer.classList.add("d-none")
    technicianApp.classList.add("d-none")
    technicianPage.classList.add("d-none")
    payment.classList.remove("d-none")
    ratingSection.classList.add("d-none")
}

function gotoRate(id) {
    goTop()
    showRatingSection()
    reservID=id
    categoryDetails.classList.add("d-none")
    home.classList.add("d-none")
    mycar.classList.add("d-none")
    login.classList.add("d-none")
    register.classList.add("d-none")
    servicesSection.classList.add("d-none")
    SubCatContainer.classList.add("d-none")
    technicianApp.classList.add("d-none")
    technicianPage.classList.add("d-none")
    payment.classList.add("d-none")
    ratingSection.classList.remove("d-none")
}

async function gotoTechnicianProfile() {
    try {
        await getReservationsForTechnician(); // انتظر جلب البيانات قبل الانتقال
        categoryDetails.classList.add("d-none");
        home.classList.add("d-none");
        mycar.classList.add("d-none");
        login.classList.add("d-none");
        register.classList.add("d-none");
        servicesSection.classList.add("d-none");
        SubCatContainer.classList.add("d-none");
        technicianApp.classList.add("d-none");
        technicianPage.classList.remove("d-none");
        payment.classList.add("d-none");
        ratingSection.classList.add("d-none")

        displayReservationData(); // بعد التبديل، اعرض البيانات في الجدول
    } catch (error) {
        console.error("Error in gotoTechnicianProfile:", error);
    }
}

function goTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // لجعل التمرير سلساً
    });
}
/******************* login logic ****************** */

const loginPhoneRegex = /^(?:\+966|05)\d{8}$/; // Saudi phone number regex for login
const loginPasswordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/; // Password validation regex for login

const loginFields = {
    phone: document.getElementById('loginPhone'),
    password: document.getElementById('loginPassword'),
    submitButton: document.getElementById('loginSubmitButton')
};

// Function to validate each field independently for login
function validateLoginField(field) {
    switch (field.id) {
        case 'loginPhone':
            toggleLoginValidationClass(field, loginPhoneRegex.test(field.value));
            break;
        case 'loginPassword':
            toggleLoginValidationClass(field, loginPasswordRegex.test(field.value));
            break;
    }
    checkLoginFormValidity();
}

// Add and remove validation classes for login
function toggleLoginValidationClass(field, isValid) {
    if (isValid) {
        field.classList.add('is-valid');
        field.classList.remove('is-invalid');
    } else {
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
    }
}

// Check the entire login form validity
function checkLoginFormValidity() {
    const isLoginFormValid =
        loginFields.phone.classList.contains('is-valid') &&
        loginFields.password.classList.contains('is-valid');

    loginFields.submitButton.disabled = !isLoginFormValid;
}

// Add listeners to validate only the active field for login
Object.values(loginFields).forEach(field => {
    if (field.id !== 'loginSubmitButton') {
        field.addEventListener('input', () => validateLoginField(field));
        field.addEventListener('focus', () => validateLoginField(field));
    }
});

// Form submission for login
document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const loginSuccessMsg = document.getElementById('loginSuccess');
    const loginErrorMsg = document.getElementById('loginError');

    try {
        const response = await fetch(`${baseURL}/api/Auth/login`, { // Update the API endpoint to your login URL
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phoneNumber: loginFields.phone.value,
                password: loginFields.password.value
            })
        });

        if (response.ok) {

            const data = await response.json();
            loginSuccessMsg.classList.remove('d-none');
            loginErrorMsg.classList.add('d-none');
            document.getElementById('loginForm').reset();
            Object.values(loginFields).forEach(field => field.classList.remove('is-valid', 'is-invalid'));
            loginFields.submitButton.disabled = true;
            localStorage.setItem("token", data.token)
            decodeToken(data.token)
            console.log(data.token);
            checkLogin()
            setTimeout(() => {
                gotoHome();
                loginSuccessMsg.classList.add('d-none');
            }, 1000);
           // Redirect to home or dashboard
            
        } else {
            throw new Error('Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        loginSuccessMsg.classList.add('d-none');
        loginErrorMsg.classList.remove('d-none');
    }
});

/*************************************** token decode ************************************** */


function decodeToken(token) {
    try {
        // تقسيم التوكن إلى أجزائه الثلاثة
        const [header, payload, signature] = token.split('.');

        // فك ترميز الجزء الثاني (Payload)
        const decodedPayload = JSON.parse(atob(payload));

        // الوصول إلى القيمة باستخدام string key
        const roleKey = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
         role = decodedPayload[roleKey]; // قراءة الدور
         if(role.toLocaleString()=='Technician'){

            techProfile.classList.remove("d-none")

         }else{
            userProfile.classList.remove("d-none")
         }
            console.log(role);
            
        return role; // إرجاع الدور
    } catch (error) {
        console.error("Invalid token:", error);
        return null; // إذا كان التوكن غير صالح
    }
}



/****************************** register form logic ***************************/



const phoneRegex = /^(?:\+966|05)\d{8}$/; // Saudi phone number regex
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/; // Password validation regex

const fields = {
    name: document.getElementById('registerName'),
    phone: document.getElementById('registerPhone'),
    password: document.getElementById('registerPassword'),
    userType: document.getElementById('registerUserType'),
    category: document.getElementById('registerCategory'),
    submitButton: document.getElementById('registerSubmitButton')
};

const categoryGroup = document.getElementById('categoryGroup');


async function getAllSubCategories() {
    try {
        // انتظار استجابة `fetch`
        let response = await fetch(`${baseURL}/api/SubCategory/GetAll`);
        
        // التحقق من حالة الاستجابة
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // تحليل البيانات بصيغة JSON
        let data = await response.json();
        
        categories=data.data.collection
        // عرض البيانات في الكونسول
        console.log(categories);
        
        // يمكنك إضافة معالجة إضافية هنا إذا لزم الأمر
        return data; // إرجاع البيانات إذا كنت بحاجة لاستخدامها في مكان آخر
    } catch (error) {
        // التعامل مع الأخطاء
        console.error('Error fetching subcategories:', error);
    }
}


// Populate category dropdown
function populateCategories() {
    fields.category.innerHTML = '<option value="">Choose...</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        fields.category.appendChild(option);
    });
}

// Function to validate each field independently
function validateField(field) {
    switch (field.id) {
        case 'registerName':
            toggleValidationClass(field, field.value.trim().length > 0);
            break;
        case 'registerPhone':
            toggleValidationClass(field, phoneRegex.test(field.value));
            break;
        case 'registerPassword':
            toggleValidationClass(field, passwordRegex.test(field.value));
            break;
        case 'registerUserType':
            toggleValidationClass(field, field.value.trim().length > 0);
            handleCategoryVisibility();
            break;
        case 'registerCategory':
            toggleValidationClass(field, field.value.trim().length > 0 || fields.userType.value !== "1");
            break;
    }
    checkFormValidity();
}

// Show or hide category based on user type
function handleCategoryVisibility() {
    if (fields.userType.value === "1") {
        categoryGroup.classList.remove('d-none');
        populateCategories();
    } else {
        categoryGroup.classList.add('d-none');
        fields.category.value = ""; // Reset category value
        fields.category.classList.remove('is-valid', 'is-invalid');
    }
}

// Add and remove validation classes
function toggleValidationClass(field, isValid) {
    if (isValid) {
        field.classList.add('is-valid');
        field.classList.remove('is-invalid');
    } else {
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
    }
}

// Check the entire form validity
function checkFormValidity() {
    const isFormValid =
        fields.name.classList.contains('is-valid') &&
        fields.phone.classList.contains('is-valid') &&
        fields.password.classList.contains('is-valid') &&
        fields.userType.classList.contains('is-valid') &&
        (fields.category.classList.contains('is-valid') || fields.userType.value !== "1");

    fields.submitButton.disabled = !isFormValid;
}

// Add listeners to validate only the active field
Object.values(fields).forEach(field => {
    if (field.id !== 'registerSubmitButton') {
        field.addEventListener('input', () => validateField(field));
        field.addEventListener('focus', () => validateField(field));
    }
});

// Form submission
document.getElementById('registerForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const successMsg = document.getElementById('registerSuccess');
    const errorMsg = document.getElementById('registerError');

    try {
        const response = await fetch(`${baseURL}/api/Auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: fields.name.value,
                phoneNumber: fields.phone.value,
                password: fields.password.value,
                subCategory_Id: fields.userType.value === "1" ? fields.category.value : null,
                role: +fields.userType.value
            })
        });

        if (response.ok) {
            successMsg.classList.remove('d-none');
            errorMsg.classList.add('d-none');
            document.getElementById('registerForm').reset();
            Object.values(fields).forEach(field => field.classList.remove('is-valid', 'is-invalid'));
            fields.submitButton.disabled = true;
           setTimeout(() => {
            gotoLogin();
            successMsg.classList.add('d-none');
           }, 1000); 

        } else {
            throw new Error('Failed to register');
        }
    } catch (error) {
        console.error('Error:', error);
        successMsg.classList.add('d-none');
        errorMsg.classList.remove('d-none');
    }
});





function logoutfun() {
    gotoLogin()
    localStorage.removeItem("token")
    navLogin.classList.remove("d-none")
    navRegister.classList.remove("d-none")
    navLogout.classList.add("d-none")
    techProfile.classList.add("d-none")
    userProfile.classList.add("d-none")
}




/*************************************** category deatails *********************************** */


// Fetch data for a specific category and its subcategories
async function GetCategoryDetails(categoryId) {

    goTop()
    gotoCategory()
    try {
        const response = await fetch(`${baseURL}/api/Category/${categoryId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const categoryData = await response.json();

        // Clear categoryDetails before rendering (optional, based on your logic)
        categoryDetails.innerHTML = "";

        // Render the main category
        const categorySection = `
      <div class="category-main mb-5 text-center pt-5">
        <h2 class="fw-bold text-primary pt-3">${categoryData.data.name}</h2>
        <p class="text-muted">${categoryData.data.description}</p>
      </div>
    `;
        categoryDetails.innerHTML += categorySection;

        // Render subcategories
        if (categoryData.data.subCategoriesDtos && categoryData.data.subCategoriesDtos.length > 0) {
            const subcategoriesSection = `
      <div class=" container ">
        <div class=" row ">
          ${categoryData.data.subCategoriesDtos
                    .map(
                        (sub) => `
            <div class="col-lg-4 col-md-6 pt-3">
              <div class="card text-center border-0 shadow h-100">
                <div class="card-body p-4">
               <div class="mb-3">
                <i class="fas  ${sub.icon} fa-4x  text-primary mb-2"></i>
              </div>
                  <h4 class="card-title fw-bold mb-3">${sub.name}</h4>
                  <p class="card-text text-muted">${sub.description}</p>
                  <button class="btn btn-outline-primary" onClick="GetSubCategoryDetails('${sub.id}')">Technicians</button>
                </div>
              </div>
            </div>
          `
                    )
                    .join("")}
        </div>
         </div>
      `;
            categoryDetails.innerHTML += subcategoriesSection;
        } else {
            categoryDetails.innerHTML += `<p class="text-muted text-center">No subcategories found for this category.</p>`;
        }
    } catch (error) {
        console.error("Error fetching category details:", error);
        categoryDetails.innerHTML = `<p class="text-danger text-center">Failed to load category details. Please try again later.</p>`;
    }
}

// Call the function with a specific category ID
// Replace with the actual category ID


/******************************************* subCategory details ************************************* */


// Fetch data for a specific category and its subcategories
async function GetSubCategoryDetails(SubCategoryId) {

    goTop()
    gotoSubCategory()
    try {
        const response = await fetch(`${baseURL}/api/SubCategory/${SubCategoryId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);

        }

        const SubCategoryData = await response.json();

        console.log(SubCategoryData.data.technicians[0]);

        // Clear SubCatContainer before rendering (optional, based on your logic)
        SubCatContainer.innerHTML = "";

        // Render the main category
        const SubCategorySection = `
      <div class="category-main mb-5 text-center pt-5">
        <h2 class="fw-bold text-primary pt-3">${SubCategoryData.data.name}</h2>
        <p class="text-muted">${SubCategoryData.data.description}</p>

        <h5 class="text-center py-3"> Book an appointment with a technician for this service</h5>
      </div>
    `;
        SubCatContainer.innerHTML += SubCategorySection;

        // Render subcategories
        if (SubCategoryData.data.technicians && SubCategoryData.data.technicians.length > 0) {
            const subcategoriesSection = `
      <div class=" container ">
        <div class=" row ">
          ${SubCategoryData.data.technicians
                    .map(
                        (sub) => `
            <div class="col-lg-4 col-md-6 pt-3">
              <div class="card text-center border-0 shadow h-100">
                <div class="card-body p-4">
              <div class="mb-3 overflow-hidden">
                <img src="./assets/pngtree-maintenance-technician-cartoon-png-image_14887469 (1).png" class="w-75" alt="">
              </div>
                  <h4 class="card-title fw-bold mb-3">${sub.name}</h4>
                  <p class="card-text  text-muted">phone : ${sub.phoneNumber}</p>
                  <button class="btn btn-outline-primary" onClick='renderTable(${JSON.stringify(sub)})'>Available appointment</button>
                </div>
              </div>
            </div>
          `
                    )
                    .join("")}
        </div>
         </div>
      `;
            SubCatContainer.innerHTML += subcategoriesSection;
        } else {
            SubCatContainer.innerHTML += `<p class="text-muted text-center">No technicians found for this category.</p>`;
        }
    } catch (error) {
        console.error("Error fetching category details:", error);
        SubCatContainer.innerHTML = `<p class="text-danger text-center">Failed to load subcategories details. Please try again later.</p>`;
    }
}



/**************************************** technician avilably appointment ************************************* */

let booking;

function getVisit(techn, visit) {
    if (localStorage.getItem("token") && role === "Client") {
        booking = {
            technicianID: techn.id,
            technicianName: techn.name,
            technicianNumber: techn.phoneNumber,
            visit: visit
        };

        selectedTechnicians.push(booking);

        // إعادة تحديث الجدول بعد الحجز
        renderTable(techn);
    } else if (localStorage.getItem("token") && role !== "Client") {
        window.alert("You cannot book as a technician");
        gotoHome();
    } else {
        alert("You must log in before booking");
        gotoLogin();
    }
}

// Function to render visits table
function renderTable(technician) {
    gotoTechnicianApp();
    goTop();

    // Update technician's name and phone dynamically
    document.getElementById('technician-name').textContent = technician.name;
    document.getElementById('technician-phone').textContent = technician.phoneNumber;

    // Clear existing table rows
    const tableBody = document.querySelector("#visits-table tbody");
    tableBody.innerHTML = '';

    // Ensure that 'technician.visits' is an array and loop through each visit
    if (Array.isArray(technician.visits)) {
        technician.visits.forEach(visit => {
            const row = document.createElement("tr");
            
            selectedTechnicians.forEach((v)=>{
                if(visit.id==v.visit.id){
                 
                    visit.isAvailable=false
                    
                }else{
                    
                }
            })

            // Add cells to the row dynamically
            row.innerHTML = `
          <td>${(new Date(visit.startTime).toLocaleString().split(',')[0])}</td>
          <td>${(new Date(visit.startTime).toLocaleString().split(',')[1])}</td>
          <td>${(new Date(visit.endTime).toLocaleString().split(',')[1])}</td>
          <td>${visit.price}</td>
          <td class="justify-content-between"><span class="badge ${visit.isAvailable ? 'bg-success' : 'bg-danger'}">${visit.isAvailable ? 'Available' : 'Unavailable'}</span> </td>
          <td>
            <span 
              class="btn pointer btn-warning ${visit.isAvailable ? '' : 'd-none'}" 
              onClick='getVisit(${JSON.stringify(technician)},${JSON.stringify(visit)})'>Book Now</span>
          </td>`;

            // Append the row to the table body

            tableBody.appendChild(row);
        });
    } else {
        console.warn('No visits data available');
    }
}




/********************************************* technician reservations *************************************** */

async function getReservationsForTechnician() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Token not found in localStorage");
        }

        const response = await fetch(`${baseURL}/api/Reservation/GetReservationsForTechnician`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            reservationData = data.data; 
            console.log(data);
            // حفظ البيانات في المتغير global
        } else {
            const errorData = await response.json();
            console.error("Error from server:", errorData);
            throw new Error(`Failed to fetch reservations: ${errorData.message}`);
        }
    } catch (error) {
        console.error("Error fetching reservations:", error);
    }
}

// دالة لعرض البيانات في الجدول
function displayReservationData() {
    const tableBody = document.getElementById('reservationTable1');
    const noDataMessage = document.getElementById('noDataMessage'); // عنصر لعرض رسالة لا يوجد بيانات

    if (!reservationData || reservationData.length === 0) {
        console.log("No reservation data available.");

        // إظهار رسالة لا توجد حجوزات
        noDataMessage.classList.remove("d-none");
        tableBody.innerHTML = ""; // التأكد من أن الجدول فارغ

        return; // لا تعرض البيانات إذا لم تكن هناك أي بيانات
    }

    // إخفاء رسالة لا توجد حجوزات
    noDataMessage.classList.add("d-none");

    // إفراغ الجدول قبل إضافة بيانات جديدة
    tableBody.innerHTML = "";

    // عرض البيانات
    reservationData.forEach(data => {
        const row = document.createElement('tr');

        // تحديد حالة البادج والزر بناءً على الحالة
        let statusBadge = '';
        let doneButtonVisibility = 'd-block'; // الزر ظاهر افتراضيًا
        if (data.status === "Upcoming") {
            statusBadge = '<span class="badge bg-success">Upcoming</span>';
        } else if (data.status === "Finished") {
            statusBadge = '<span class="badge bg-dark">Finished</span>';
            doneButtonVisibility = 'd-none'; // إخفاء الزر إذا كانت الحالة Finished
        } else {
            statusBadge = data.status; // إذا كانت الحالة غير معروفة أو غير مدعومة
        }

        row.innerHTML = `
            <td>${data.clientName}</td>
            <td>${data.phoneNumber?data.phoneNumber:'---'}</td>
            <td>${(new Date(data.startTime).toLocaleString().split(',')[0])}</td>
            <td>${(new Date(data.startTime).toLocaleString().split(',')[1])}</td>
            <td>${(new Date(data.endTime).toLocaleString().split(',')[1])}</td>
            <td>${statusBadge}</td>
            <td>${data.price} SAR</td>
            <td><button class="btn btn-danger py-0 ${doneButtonVisibility}" onclick="viewReservationDetails('${data.reservationId}')">Done</button></td>
        `;

        tableBody.appendChild(row);
    });
}


// دالة لعرض تفاصيل الحجز عند الضغط على الزر
async function viewReservationDetails(reservationId) {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Token not found in localStorage");
    }

    try {
        // إرسال الطلب لتغيير حالة الحجز
        const response = await fetch(`${baseURL}/api/Reservation/FinishedReservation?reservationId=${reservationId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            alert("Visit done successfully");
            gotoTechnicianProfile(); // الانتقال إلى صفحة بيانات الفني بعد النجاح
        } else {
            const errorData = await response.json();
            alert("There was an error, please try again.");
            console.error("Error:", errorData); // تسجيل الخطأ لمساعدتك في التصحيح
        }
    } catch (error) {
        alert("An unexpected error occurred, please try again.");
        console.error("Error fetching reservation details:", error); // تسجيل الخطأ في حالة حدوث استثناء غير متوقع
    }
}


/******************************************* user resirvation history ************************************** */

async function getReservationsForUser() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Token not found in localStorage");
        }

        const response = await fetch(`${baseURL}/api/Reservation/GetReservationForTechnician`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            PrevusreservationData = data.data; 
            console.log(data);
            // حفظ البيانات في المتغير global
        } else {
            const errorData = await response.json();
            console.error("Error from server:", errorData);
            throw new Error(`Failed to fetch reservations: ${errorData.message}`);
        }
    } catch (error) {
        console.error("Error fetching reservations:", error);
    }
}

function displayReservationDataForUser() {
    const tableBody = document.getElementById('reservationTable');
    const noDataMessage = document.getElementById('noDataMessage'); // عنصر لعرض رسالة لا يوجد بيانات

    if (!PrevusreservationData || PrevusreservationData.length === 0) {
        console.log("No reservation data available.");

        // إظهار رسالة لا توجد حجوزات
        noDataMessage.classList.remove("d-none");
        tableBody.innerHTML = ""; // التأكد من أن الجدول فارغ

        return; // لا تعرض البيانات إذا لم تكن هناك أي بيانات
    }

    // إخفاء رسالة لا توجد حجوزات
    noDataMessage.classList.add("d-none");

    // إفراغ الجدول قبل إضافة بيانات جديدة
    tableBody.innerHTML = "";

    // عرض البيانات
    PrevusreservationData.forEach(data => {
        const row = document.createElement('tr');

        // تحديد حالة البادج والزر بناءً على الحالة
        let statusBadge = '<span class="badge bg-dark">Finished</span>';
        let RateButtonVisibility = 'd-none'; // الزر ظاهر افتراضيًا
        if (data.status === "Upcoming") {
             statusBadge = '<span class="badge bg-success">Upcoming</span>';
        } else if (data.status === "Finished") {
            statusBadge = '<span class="badge bg-dark">Finished</span>';
            RateButtonVisibility = 'd-block'; // إخفاء الزر إذا كانت الحالة Finished
        } else {
            statusBadge = data.status; // إذا كانت الحالة غير معروفة أو غير مدعومة
        }

        // توليد النجوم بناءً على قيمة rate
        const stars = renderStars(data.rate || 0);

        row.innerHTML = `
            <td>${data.technicianName}</td>
            <td>${data.phoneNumber ? data.phoneNumber : '---'}</td>
            <td>${(new Date(data.startTime).toLocaleString().split(',')[0])}</td>
            <td>${(new Date(data.startTime).toLocaleString().split(',')[1])}</td>
            <td>${(new Date(data.endTime).toLocaleString().split(',')[1])}</td>
            <td>${statusBadge}</td>
            <td>${data.price} SAR</td>
            <td  class="${RateButtonVisibility}">${stars}</td>
            <td>
                <button class="btn btn-primary py-0 ${RateButtonVisibility}" onclick="gotoRate('${data.reservationId}')">Add a rating</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

function renderStars(rate) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rate) {
            starsHTML += '<span class="star2 filled text-warning">&#9733;</span>'; // نجمة ممتلئة
        } else {
            starsHTML += '<span class="star2 empty">&#9734;</span>'; // نجمة فارغة
        }
    }
    return starsHTML;
}



function showRatingSection() {
    const ratingSection = document.getElementById('ratingSection');
    ratingSection.classList.remove('d-none');
}

// Add functionality for rating
const stars = document.querySelectorAll('.star');
var selectedRating = 0;
var reservID = 0;

stars.forEach(star => {
    star.addEventListener('click', function () {
        // Reset all stars
        stars.forEach(s => s.classList.remove('selected'));

        // Select stars up to the clicked one
        for (let i = 0; i < this.dataset.value; i++) {
            stars[i].classList.add('selected');
        }

        // Set the selected rating
        selectedRating = this.dataset.value;

        // Enable the submit button
        const submitButton = document.getElementById('submitRating');
        submitButton.removeAttribute('disabled');
    });
});

// Handle rating submission
document.getElementById('submitRating').addEventListener('click', async function () {
    await updateRate(selectedRating, reservID);
    // Optionally hide the rating section after submission
    gotoCar();
});



  async function updateRate(rate, reservationId) {
    const apiUrl = `https://localhost:7137/api/Reservation/Rate`;
  
    // Get the token from localStorage
    const token = localStorage.getItem('token');
  
    if (!token) {
      alert('Authentication token not found. Please log in.');
      return;
    }
  
    try {
      // Construct the query string with rate and reservationId
      const urlWithParams = `${apiUrl}?reservationId=${reservationId}&rate=${rate}`;
  
      // Make the fetch request
      const response = await fetch(urlWithParams, {
        method: 'PUT', // Assuming it's a PUT request
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      // Handle the response
      if (response.ok) {
        const data = await response.json();
        alert('Rating updated successfully!');
        selectedRating=0
        console.log(data); // Log the response if needed
      } else {
        const error = await response.json();
        alert(`Failed to update rating: ${error.message}`);
        console.error(error);
      }
    } catch (error) {
      alert('An error occurred while updating the rating.');
      console.error(error);
    }
  }
  