import React,{StrictMode} from 'react';import {createRoot} from 'react-dom/client';import {GlobalErrorBoundary} from '../../../../src/shared/errors/GlobalErrorBoundary';import {applyErrorMetadata} from '../../../../src/shared/errors/errorMetadata';
const rootContainer=document.getElementById('root')!;const nativeRecovery=rootContainer.innerHTML;
const rootOptions = import.meta.env.PROD ? {
  // componentDidCatch owns the sanitized caught-error diagnostic.
  onCaughtError: () => {},
  onUncaughtError: () => {
    console.error('[Zelo] APP_ROOT_FAILED')
    rootContainer.innerHTML = nativeRecovery
    rootContainer.querySelector('[data-boot-fallback]')?.setAttribute('data-boot-failed', '')
    rootContainer.querySelector('[data-boot-fallback]')?.setAttribute('data-error-code', '500')
    rootContainer.querySelectorAll<HTMLImageElement>('img[data-error-src]').forEach(image => {
      image.src = image.dataset.errorSrc!
    })
    applyErrorMetadata(500)
    const heading = rootContainer.querySelector<HTMLElement>('#ze-error-heading')
    if (heading) {
      heading.tabIndex = -1
      heading.focus({ preventScroll: true })
    }
  },
} : undefined

window.failure=true;window.renderCount=0;
function Fault(){window.renderCount++;if(window.failure)throw new Error('QA_FAKE_SECRET_NEVER_EXPOSE');return React.createElement('h1',null,'RECOVERED')}
function Provider({children}){if(window.failure)throw new Error('QA_FAKE_PROVIDER_SECRET');return children}
const Lazy=React.lazy(()=>Promise.reject(new Error('QA_FAKE_LAZY_SECRET')));
const mode=new URLSearchParams(location.search).get('mode');const child=mode==='provider'?React.createElement(Provider,null,React.createElement(Fault)):mode==='lazy'?React.createElement(React.Suspense,{fallback:null},React.createElement(Lazy)):React.createElement(Fault);
createRoot(rootContainer,rootOptions).render(React.createElement(StrictMode,null,mode==='root'?child:React.createElement(GlobalErrorBoundary,null,child)));
