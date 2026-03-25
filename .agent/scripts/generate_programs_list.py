import os
import json
import datetime
import platform

def get_creation_time(path):
    if platform.system() == 'Windows':
        return os.path.getctime(path)
    else:
        # Unix systems doesn't support easy creation time access, using modified time as fallback or st_birthtime if available
        stat = os.stat(path)
        try:
            return stat.st_birthtime
        except AttributeError:
            # We return modified time as fallback for Linux/Unix
            return stat.st_mtime

def scan_files(root_dir, prefix):
    programs = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith('.js') and 'node_modules' not in dirpath and 'build' not in dirpath:
                full_path = os.path.join(dirpath, filename)
                # Calculate relative path from project root for display
                rel_path = os.path.relpath(full_path, 'c:\\git\\zap')
                
                # Get timestamps
                try:
                    ctime = get_creation_time(full_path)
                    mtime = os.path.getmtime(full_path)
                    
                    created_str = datetime.datetime.fromtimestamp(ctime).strftime('%d/%m/%Y %H:%M')
                    modified_str = datetime.datetime.fromtimestamp(mtime).strftime('%d/%m/%Y %H:%M')
                except Exception:
                    created_str = "N/A"
                    modified_str = "N/A"

                # Determine type
                desc = "Componente de Frontend" if "frontend" in root_dir else "Módulo de Backend"
                details = f"Arquivo localizado em: {rel_path}"
                
                programs.append({
                    "id": filename.replace('.', '_') + '_' + str(hash(rel_path)),
                    "title": filename,
                    "component": filename,
                    "description": desc,
                    "details": details,
                    "path": rel_path,
                    "created": created_str,
                    "modified": modified_str
                })
    return programs

frontend_programs = scan_files('c:\\git\\zap\\frontend\\src', 'frontend')
backend_programs = scan_files('c:\\git\\zap\\backend\\src', 'backend')

all_programs = frontend_programs + backend_programs

# Generate the JS file content
js_content = """/**
 * @fileoverview Componente para listar e documentar os programas do sistema.
 * LISTA GERADA AUTOMATICAMENTE COM TODOS OS ARQUIVOS DO SISTEMA.
 */
import React, { useState } from 'react';
import './Documentation.css'; 

const programsData = """ + json.dumps(all_programs, indent=2) + """;

const ProgramsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const filteredPrograms = programsData.filter(program =>
    program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.component.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (program.path && program.path.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="programs-container">
      <div className="programs-header-search">
        <h2>Documentação de Programas ({programsData.length} itens)</h2>
        <input
          type="text"
          placeholder="🔍 Buscar em todos os programas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="programs-search-input"
        />
      </div>

      <div className="programs-list">
        {filteredPrograms.length > 0 ? (
          filteredPrograms.map(program => (
            <div 
              key={program.id} 
              className={`program-card ${expandedId === program.id ? 'expanded' : ''}`}
              onClick={() => toggleExpand(program.id)}
            >
              <div className="program-card-header">
                <div className="program-icon">{program.path.includes('backend') ? '⚙️' : '📄'}</div>
                <div className="program-info">
                  <h3>{program.title}</h3>
                  <div className="program-meta">
                    <span className="file-badge">{program.path}</span>
                    <span className="date-badge">📅 Alt: {program.modified}</span>
                  </div>
                </div>
                <div className="program-chevron">
                  {expandedId === program.id ? '▲' : '▼'}
                </div>
              </div>
              
              {expandedId === program.id && (
                <div className="program-card-details">
                  <hr />
                  <p><strong>Tipo:</strong> {program.description}</p>
                  <p><strong>Criado em:</strong> {program.created}</p>
                  <p><strong>Última modificação:</strong> {program.modified}</p>
                  <p className="tech-details">Caminho: <code>{program.path}</code></p>
                </div>
              )}
            </div>
          ))
        ) : (
           <div className="no-results">Nenhum programa encontrado para "{searchTerm}"</div>
        )}
      </div>
    </div>
  );
};

export default ProgramsList;
"""

with open('c:\\git\\zap\\frontend\\src\\components\\ProgramsList.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Generated ProgramsList.js with {len(all_programs)} items.")
