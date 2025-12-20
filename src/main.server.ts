import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { config } from './app/app.config.server';

const bootstrap = (context: BootstrapContext) => {
  return bootstrapApplication(AppComponent, {
    ...config,
    providers: [
      ...(config.providers || []),
      provideRouter(routes)
    ]
  }, context);
};

export default bootstrap;
