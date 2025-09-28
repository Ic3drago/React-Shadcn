import dynamic from 'next/dynamic'

const DynamicRegistroTickeos = dynamic(
  () => import('./RegistroTickeos'),
  { 
    ssr: false,
    loading: () => <p>Cargando registro de tickeos...</p>
  }
)

export default DynamicRegistroTickeos