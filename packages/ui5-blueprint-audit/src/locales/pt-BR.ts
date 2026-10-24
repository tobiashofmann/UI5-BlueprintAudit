import type en from "./en.js";

/** Portuguese (Brazil) translation of the CLI/reporters/engine's own labels; see `en.ts` for the reference bundle. */
const ptBR: Record<keyof typeof en, string> = {
  "report.title": "UI5 BlueprintAudit Report",
  "report.generatedAt": "Gerado em: {date}",
  "report.summary": "Resumo",
  "report.details": "Detalhes",
  "report.projectType": "Tipo de projeto: {type}",
  "report.loadError": "Erro ao carregar o projeto: {error}",
  "report.col.project": "Projeto",
  "report.col.type": "Tipo",
  "report.col.errors": "Erros",
  "report.col.warnings": "Avisos",
  "report.col.status": "Status",
  "report.col.rule": "Regra",
  "report.col.description": "Descrição",
  "report.col.severity": "Severity",
  "report.col.findings": "Findings",
  "report.badge.ok": "OK",
  "report.badge.warn": "Aviso",
  "report.badge.error": "Erro",

  "config.missingProjectType":
    'Nenhum tipo de projeto especificado. Defina --type fs|fe|lib na linha de comando ou "projectType" em {configPath}.',
  "config.invalidProjectType": 'Tipo de projeto inválido "{projectType}". Permitidos: {types}.',
  "config.unknownLanguage": "Idioma(s) desconhecido(s): {requested}. Disponíveis: {available}.",

  "plugin.invalidDefaultExport": 'O plugin "{spec}" não tem um export default válido ({{ name, apiVersion, rules }}).',
  "plugin.unsupportedApiVersion":
    'O plugin "{name}" declara apiVersion "{apiVersion}", suportado é apiVersion "{supported}".',
  "plugin.npmResolveFailed": 'O plugin "{spec}" não pôde ser resolvido a partir do diretório do projeto.',

  "engine.unexpectedError": "Erro inesperado: {error}",
};

export default ptBR;
