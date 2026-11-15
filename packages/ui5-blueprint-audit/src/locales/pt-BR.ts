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
  "config.notAMapping": "{configPath} deve conter um mapeamento YAML.",
  "config.invalidLanguages": '"languages" em {configPath} deve ser uma lista de códigos de idioma, p. ex. [de, en].',
  "config.invalidPlugins": '"plugins" em {configPath} deve ser uma lista de caminhos de plugins ou nomes de pacotes.',
  "config.invalidRules": '"rules" em {configPath} deve ser um mapeamento de ID de regra para severidade.',
  "config.invalidRuleConfig":
    'Configuração inválida para a regra "{ruleId}". Esperado: {severities} ou uma lista [severidade, opções].',
  "config.unknownRule": "Regra(s) desconhecida(s) na configuração: {rules}.",

  "context.unparseableFile": "Não foi possível interpretar {file}: {error}",

  "plugin.invalidDefaultExport": 'O plugin "{spec}" não tem um export default válido ({{ name, apiVersion, rules }}).',
  "plugin.unsupportedApiVersion":
    'O plugin "{name}" declara apiVersion "{apiVersion}", suportado é apiVersion "{supported}".',
  "plugin.npmResolveFailed": 'O plugin "{spec}" não pôde ser resolvido a partir do diretório do projeto.',
  "plugin.invalidRule":
    'Plugin "{name}": a regra "{ruleId}" precisa de meta ({{ descriptionKey, defaultSeverity, projectTypes }}) e de uma função check.',

  "engine.unexpectedError": "Erro inesperado: {error}",
  "engine.ruleCrashed": "A regra falhou e não pôde ser avaliada: {error}",
};

export default ptBR;
