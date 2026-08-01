const fs = require('fs');
let c = fs.readFileSync('src/components/(Kore)/clientes/ClientesDashboard.tsx', 'utf8');

c = c.replace('const [expandedClient, setExpandedClient] = useState<string | null>(null);', 'const [selectedClientForModal, setSelectedClientForModal] = useState<Cliente | null>(null);');

c = c.replace(/  const toggleExpand = \(clientId: string\) => \{\s*setExpandedClient\(expandedClient === clientId \? null : clientId\);\s*\};\s*/, '');

c = c.replace('if (expandedClient === client.id) {\n        setExpandedClient(null);\n      }', 'if (selectedClientForModal?.id === client.id) {\n        setSelectedClientForModal(null);\n      }');

c = c.replace('const isExpanded = expandedClient === client.id;\n\n                  return (', 'return (');
c = c.replace('onClick={() => toggleExpand(client.id)}', 'onClick={() => setSelectedClientForModal(client)}');

const tableMatch = c.match(/(\s*<div className="overflow-x-auto">\s*<table[\s\S]*?<\/table>\s*<\/div>)/);
const tableHtml = tableMatch ? tableMatch[1] : '';

const patternToRemove = /\s*<button\s*onClick=\{\(\) => toggleExpand\(client\.id\)\}\s*className="flex items-center justify-center p-2 bg-black\/5 dark:bg-white\/5 hover:bg-black\/10 dark:hover:bg-white\/15 text-muted-foreground hover:text-black dark:hover:text-white rounded-lg border border-border\/50 dark:border-white\/5 transition-colors cursor-pointer w-full"\s*title=\{isExpanded \? "Ocultar detalles" : "Ver detalles"\}\s*>\s*\{isExpanded \? <ChevronUp size=\{16\} \/> : <ChevronDown size=\{16\} \/>\}\s*<\/button>\s*<\/div>\s*<\/div>\s*\{\/\* Expandable Project Details \*\/\}\s*<AnimatePresence initial=\{false\}>\s*\{isExpanded && \([\s\S]*?\)\}\s*<\/AnimatePresence>/;
c = c.replace(patternToRemove, '\n                        </div>\n                      </div>');

const modalHtml = `
          {/* Modal de Desglose de Proyectos */}
          <AnimatePresence>
            {selectedClientForModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={() => setSelectedClientForModal(null)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-[#121212] border border-border/50 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between p-5 border-b border-border/50 dark:border-white/10 shrink-0">
                    <div>
                      <h3 className="font-black text-lg">Desglose de Proyectos</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{selectedClientForModal.nombre}</p>
                    </div>
                    <button
                      onClick={() => setSelectedClientForModal(null)}
                      className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="p-5 overflow-y-auto flex-1">
                    {selectedClientForModal.proyectosList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-sm text-muted-foreground italic font-semibold">
                          Este cliente no tiene ningún proyecto registrado.
                        </p>
                      </div>
                    ) : (
                      ${tableHtml ? "`" + tableHtml.replace(/client\.proyectosList/g, 'selectedClientForModal.proyectosList').replace(/client\.totalPagado/g, 'selectedClientForModal.totalPagado') + "`" : 'null'}
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
`;

c = c.replace('        </div>\n      </div>\n  );\n}\n', '        </div>\n' + modalHtml + '\n      </div>\n  );\n}\n');

fs.writeFileSync('src/components/(Kore)/clientes/ClientesDashboard.tsx', c);
