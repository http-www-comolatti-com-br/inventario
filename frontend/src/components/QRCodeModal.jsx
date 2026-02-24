import { QRCodeSVG } from 'qrcode.react';
import Modal from './Modal';
import { HiOutlineDownload, HiOutlinePrinter } from 'react-icons/hi';

export default function QRCodeModal({ isOpen, onClose, unidade }) {
  if (!unidade) return null;

  const qrData = JSON.stringify({
    id: unidade.id,
    tipo: 'patrimonio',
    item: unidade.modelo_nome,
    marca: unidade.marca,
    modelo: unidade.modelo_modelo,
    serie: unidade.numero_serie,
    etiqueta: unidade.etiqueta_patrimonial,
    status: unidade.status,
    categoria: unidade.categoria_nome,
    destinatario: unidade.destinatario_nome,
    local: unidade.local,
  });

  const statusLabels = {
    disponivel: 'Disponível',
    em_uso: 'Em Uso',
    manutencao: 'Manutenção',
    baixado: 'Baixado',
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const svg = document.getElementById('qr-code-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    printWindow.document.write(`
      <html>
        <head><title>QR Code - ${unidade.modelo_nome}</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
          .info { margin-top: 20px; font-size: 14px; color: #333; }
          .label { font-weight: bold; }
          h2 { color: #0f172a; }
        </style></head>
        <body>
          <h2>${unidade.modelo_nome}</h2>
          ${svgData}
          <div class="info">
            ${unidade.marca ? `<p><span class="label">Marca:</span> ${unidade.marca}</p>` : ''}
            ${unidade.modelo_modelo ? `<p><span class="label">Modelo:</span> ${unidade.modelo_modelo}</p>` : ''}
            ${unidade.numero_serie ? `<p><span class="label">Nº Série:</span> ${unidade.numero_serie}</p>` : ''}
            ${unidade.etiqueta_patrimonial ? `<p><span class="label">Etiqueta:</span> ${unidade.etiqueta_patrimonial}</p>` : ''}
            <p><span class="label">Status:</span> ${statusLabels[unidade.status] || unidade.status}</p>
            ${unidade.destinatario_nome ? `<p><span class="label">Destinatário:</span> ${unidade.destinatario_nome}</p>` : ''}
          </div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, 0, 0, 400, 400);
      const link = document.createElement('a');
      link.download = `qrcode-${unidade.etiqueta_patrimonial || unidade.numero_serie || unidade.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="QR Code do Equipamento" size="md">
      <div className="flex flex-col items-center">
        {/* QR Code */}
        <div className="bg-white p-6 rounded-2xl mb-6 shadow-lg">
          <QRCodeSVG
            id="qr-code-svg"
            value={qrData}
            size={250}
            level="H"
            includeMargin={true}
            bgColor="#ffffff"
            fgColor="#0f172a"
          />
        </div>

        {/* Informações do equipamento */}
        <div className="w-full glass-card p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-4">{unidade.modelo_nome}</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {unidade.marca && (
              <div><span className="text-gray-400">Marca:</span> <span className="text-white ml-1">{unidade.marca}</span></div>
            )}
            {unidade.modelo_modelo && (
              <div><span className="text-gray-400">Modelo:</span> <span className="text-white ml-1">{unidade.modelo_modelo}</span></div>
            )}
            {unidade.numero_serie && (
              <div><span className="text-gray-400">Nº Série:</span> <span className="text-white font-mono ml-1">{unidade.numero_serie}</span></div>
            )}
            {unidade.etiqueta_patrimonial && (
              <div><span className="text-gray-400">Etiqueta:</span> <span className="text-white font-mono ml-1">{unidade.etiqueta_patrimonial}</span></div>
            )}
            <div><span className="text-gray-400">Status:</span> <span className={`status-${unidade.status} ml-1`}>{statusLabels[unidade.status]}</span></div>
            {unidade.categoria_nome && (
              <div><span className="text-gray-400">Categoria:</span> <span className="text-white ml-1">{unidade.categoria_nome}</span></div>
            )}
            {unidade.destinatario_nome && (
              <div className="col-span-2"><span className="text-gray-400">Destinatário:</span> <span className="text-white ml-1">{unidade.destinatario_nome}</span></div>
            )}
            {unidade.local && (
              <div className="col-span-2"><span className="text-gray-400">Local:</span> <span className="text-white ml-1">{unidade.local}</span></div>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-3">
          <button onClick={handleDownload} className="btn-primary flex items-center gap-2">
            <HiOutlineDownload className="w-5 h-5" /> Baixar PNG
          </button>
          <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">
            <HiOutlinePrinter className="w-5 h-5" /> Imprimir
          </button>
        </div>
      </div>
    </Modal>
  );
}
