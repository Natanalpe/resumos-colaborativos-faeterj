let navigator: any = null;
let isRedirecting = false;

export const setNavigator = (navigate: any) => {
  navigator = navigate;
};

export const redirectTo = (to: string) => {
  if (isRedirecting) return;

  isRedirecting = true;

  if (navigator) {
    navigator(`/${to}`);
  } else {
    window.location.href = `/${to}`;
  }

  setTimeout(() => isRedirecting = false, 1000);
};