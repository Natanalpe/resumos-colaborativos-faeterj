import { BrowserRouter, useNavigate } from 'react-router-dom';
import AppRoutes from './routes/Routes';
import { setNavigator } from './utils/Navigation';
import { useEffect } from 'react';
import { ReactQueryProvider } from './providers/ReactQueryProvider';
import { ConfigProvider } from 'antd';
import ptBR from 'antd/locale/pt_BR';
import { useStorageMonitor } from './hooks/useStorageMonitor';

const NavigationSetup = () => {
  const navigate = useNavigate();
  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);
  return null;
};

function App() {
  useStorageMonitor();

  return (
    <ConfigProvider locale={ptBR}>
      <BrowserRouter>
        <ReactQueryProvider>
          <NavigationSetup />
          <AppRoutes />
        </ReactQueryProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;