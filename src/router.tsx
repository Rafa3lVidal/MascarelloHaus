import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { QuemSomos } from './pages/QuemSomos';
import { AreasDeAtuacao } from './pages/AreasDeAtuacao';
import { AreaIndividual } from './pages/AreaIndividual';
import { ArtigosEPublicacoes } from './pages/ArtigosEPublicacoes';
import { PostIndividual } from './pages/PostIndividual';
import { Contato } from './pages/Contato';

const CentralProtecaoDados = lazy(() =>
  import('./pages/CentralProtecaoDados').then((m) => ({ default: m.CentralProtecaoDados }))
);
const QuestionarioConformidade = lazy(() =>
  import('./pages/QuestionarioConformidade').then((m) => ({ default: m.QuestionarioConformidade }))
);
const CodigoConduta = lazy(() =>
  import('./pages/CodigoConduta').then((m) => ({ default: m.CodigoConduta }))
);
const CanalDenuncias = lazy(() =>
  import('./pages/CanalDenuncias').then((m) => ({ default: m.CanalDenuncias }))
);
const AdminLogin = lazy(() =>
  import('./pages/admin/AdminLogin').then((m) => ({ default: m.AdminLogin }))
);
const AdminDashboard = lazy(() =>
  import('./pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);

const RouteFallback: React.FC = () => (
  <div
    role="status"
    aria-live="polite"
    style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--color-primary)',
      fontFamily: 'var(--font-sans)',
      fontSize: '0.95rem',
    }}
  >
    Carregando conteúdo…
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Páginas Principais */}
        <Route path="/" element={<Home />} />
        <Route path="/quem-somos" element={<QuemSomos />} />
        <Route path="/quem-somos/" element={<QuemSomos />} />

        <Route path="/areas-de-atuacao" element={<AreasDeAtuacao />} />
        <Route path="/areas-de-atuacao/" element={<AreasDeAtuacao />} />
        <Route path="/areas-de-atuacao/:slug" element={<AreaIndividual />} />
        <Route path="/areas-de-atuacao/:slug/" element={<AreaIndividual />} />

        {/* Áreas de Atuação Individuais */}
        <Route path="/direito-civil-e-empresarial" element={<AreaIndividual />} />
        <Route path="/direito-civil-e-empresarial/" element={<AreaIndividual />} />
        <Route path="/direito-previdenciario" element={<AreaIndividual />} />
        <Route path="/direito-previdenciario/" element={<AreaIndividual />} />
        <Route path="/direito-do-trabalho" element={<AreaIndividual />} />
        <Route path="/direito-do-trabalho/" element={<AreaIndividual />} />
        <Route path="/protecao-de-dados-lgpd" element={<AreaIndividual />} />
        <Route path="/protecao-de-dados-lgpd/" element={<AreaIndividual />} />
        <Route path="/direito-digital-e-tecnologia" element={<AreaIndividual />} />
        <Route path="/direito-digital-e-tecnologia/" element={<AreaIndividual />} />
        <Route path="/compliance" element={<AreaIndividual />} />
        <Route path="/compliance/" element={<AreaIndividual />} />

        {/* Artigos e Publicações */}
        <Route path="/artigos-e-publicacoes" element={<ArtigosEPublicacoes />} />
        <Route path="/artigos-e-publicacoes/" element={<ArtigosEPublicacoes />} />
        <Route path="/artigos-e-publicacoes/:slug" element={<PostIndividual />} />
        <Route path="/artigos-e-publicacoes/:slug/" element={<PostIndividual />} />
        <Route path="/publicacoes" element={<Navigate to="/artigos-e-publicacoes/" replace />} />
        <Route path="/publicacoes/" element={<Navigate to="/artigos-e-publicacoes/" replace />} />

        {/* Contato & LGPD */}
        <Route path="/contato" element={<Contato />} />
        <Route path="/contato/" element={<Contato />} />

        <Route path="/central-de-protecao-de-dados" element={<CentralProtecaoDados />} />
        <Route path="/central-de-protecao-de-dados/" element={<CentralProtecaoDados />} />

        <Route path="/questionario-de-conformidade" element={<QuestionarioConformidade />} />
        <Route path="/questionario-de-conformidade/" element={<QuestionarioConformidade />} />
        <Route path="/avaliacao-de-conformidade" element={<QuestionarioConformidade />} />
        <Route path="/avaliacao-de-conformidade/" element={<QuestionarioConformidade />} />

        <Route path="/codigo-de-conduta" element={<CodigoConduta />} />
        <Route path="/codigo-de-conduta/" element={<CodigoConduta />} />

        <Route path="/canal-de-denuncias" element={<CanalDenuncias />} />
        <Route path="/canal-de-denuncias/" element={<CanalDenuncias />} />

        {/* Redirecionamentos Legados de /novosite/* */}
        <Route path="/novosite/artigos-e-publicacoes/*" element={<Navigate to="/artigos-e-publicacoes/" replace />} />
        <Route path="/novosite/codigo-de-conduta/*" element={<Navigate to="/codigo-de-conduta/" replace />} />
        <Route path="/novosite/canal-de-denuncias/*" element={<Navigate to="/canal-de-denuncias/" replace />} />
        <Route path="/novosite/compliance/*" element={<Navigate to="/compliance/" replace />} />
        <Route path="/novosite/direito-digital-e-tecnologia/*" element={<Navigate to="/direito-digital-e-tecnologia/" replace />} />
        <Route path="/novosite/protecao-de-dados-lgpd/*" element={<Navigate to="/protecao-de-dados-lgpd/" replace />} />
        <Route path="/novosite/direito-do-trabalho/*" element={<Navigate to="/direito-do-trabalho/" replace />} />
        <Route path="/novosite/direito-previdenciario/*" element={<Navigate to="/direito-previdenciario/" replace />} />
        <Route path="/novosite/direito-civil-e-empresarial/*" element={<Navigate to="/direito-civil-e-empresarial/" replace />} />

        {/* Rotas Administrativas */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/dashboard/" element={<AdminDashboard />} />
        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/dashboard/" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Rota Dinâmica para Artigos ou Páginas por Slug */}
        <Route path="/:slug" element={<PostIndividual />} />
        <Route path="/:slug/" element={<PostIndividual />} />
      </Routes>
    </Suspense>
  );
};
