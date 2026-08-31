import { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Spinner from './views/spinner/Spinner.tsx'


createRoot(document.getElementById('root')!).render(
<Suspense fallback={<Spinner />}>
        <App />
    </Suspense>
    ,
)
