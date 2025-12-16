import Sidebar from '../components/sidebar/Sidebar.vue'
import Homepage from '../views/home/Homepage.vue'
import DocumentEditor from '../views/document/DocumentEditor.vue'
import EditorTest from '../views/EditorTest.vue'

export const homeRoutes = [
  {
    path: '/home',
    component: Sidebar,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        component: Homepage
      },
      {
        path: 'document/:id',
        name: 'DocumentEditor',
        component: DocumentEditor,
        props: true
      },
      {
        path: 'editor-test',
        name: 'EditorTest',
        component: EditorTest
      }
    ]
  }
]
