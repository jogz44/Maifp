const routes = [
  {
    path: '/main',
    component: () => import('layouts/MainLayout.vue'),

    children: [
      //dashboard
      {
        path: '/dashboard',
        component: () => import('pages/DashBoard.vue'),
        meta: { requiresAuth: true },
      },

      {
        path: '/dashboard-encoder',
        component: () => import('pages/DashBoardEncoder.vue'),
        meta: { requiresAuth: true },
      },

      {
        path: '/dashboard-social',
        component: () => import('pages/DashBoardSocialWorker.vue'),
        meta: { requiresAuth: true },
      },

      {
        path: '/dashboard-doctor',
        component: () => import('pages/DashBoardDoctor.vue'),
        meta: { requiresAuth: true },
      },

      {
        path: '/dashboard-lab',
        component: () => import('pages/DashBoardLab.vue'),
        meta: { requiresAuth: true },
      },

      {
        path: '/dashboard-billing',
        component: () => import('pages/DashBoardBilling.vue'),
        meta: { requiresAuth: true },
      },

      //patients
      {
        path: '/customer',
        component: () => import('pages/NewClients.vue'),
        meta: { requiresAuth: true },
      },

      {
        path: '/customers',
        component: () => import('pages/ClientList.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/customers/profile',
        component: () => import('pages/ClientProfile.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/customers/newConsultation',
        component: () => import('pages/NewConsultation.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/customers/newPatient',
        component: () => import('src/pages/ConsultNewPatient.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/customers/returnConsultation',
        component: () => import('pages/ReturnConsultation.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/customers/returnPatient',
        component: () => import('src/pages/ConsultReturnPatient.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/customers/returnedPatientDetails',
        component: () => import('src/pages/ReturnedPatientDetails.vue'),
        meta: { requiresAuth: true },
      },

      //patient details during transaction
      {
        path: '/customers/profile/transaction',
        component: () => import('src/pages/PatientDetails.vue'),
        meta: { requiresAuth: true },
      },

      //laboratory
      {
        path: '/customers/laboratory',
        component: () => import('src/pages/PatientsLaboratory.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/customers/laboratoryTransactions',
        component: () => import('src/pages/LaboratoryTransactions.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/customers/laboratoryResults',
        component: () => import('src/pages/LaboratoryResults.vue'),
        meta: { requiresAuth: true },
      },

      //assessment
      {
        path: '/assessment',
        component: () => import('pages/AssessmentPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/assessment/profile',
        component: () => import('pages/AssessmentProfile.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/assessment/profile/transaction',
        component: () => import('pages/PatientDetailsAssessment.vue'),
        meta: { requiresAuth: true },
      },

      //fundings
      {
        path: '/fundings',
        component: () => import('pages/FundingPage.vue'),
        meta: { requiresAuth: true },
      },

      //guaranteed letter
      {
        path: '/gl',
        component: () => import('pages/GuaranteedPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/gl/report',
        component: () => import('pages/GuaranteedLetter.vue'),
        meta: { requiresAuth: true },
      },

      //billing
      {
        path: '/billing',
        component: () => import('pages/BillingPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/billing/report',
        component: () => import('pages/BillingStatement.vue'),
        meta: { requiresAuth: true },
      },

      //masterlist
      {
        path: '/masterlist',
        component: () => import('pages/MasterList.vue'),
        meta: { requiresAuth: true },
      },

      //activity log
      {
        path: '/activity',
        component: () => import('pages/ActivityLog.vue'),
        meta: { requiresAuth: true },
      },

      //user management
      {
        path: '/users/new',
        component: () => import('pages/RegisterUsers.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/users/user/',
        component: () => import('pages/UpdateUsers.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/users/list',
        component: () => import('pages/RegisteredUsersList.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/',
    component: () => import('pages/LoginPage.vue'),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
