import type en from "./en.js";

/** Brazilian Portuguese translations for the core plugin's rule descriptions and messages. */
const ptBR: Record<keyof typeof en, string> = {
  "typescript.description": "O projeto usa TypeScript.",
  "typescript.missingTsconfig": "Falta um tsconfig.json na raiz do projeto.",
  "typescript.jsInsteadOfTs": "Arquivo JavaScript em vez de TypeScript: {file}",

  "xml-views.description": "As views são implementadas como XML Views.",
  "xml-views.nonXmlView": "View não-XML encontrada: {file}",
  "xml-views.forbiddenUsage": "Uso de sap.ui.jsview/htmlview/jsonview em {file}",

  "controller-matches-view.description": "O nome do controller de cada XML View corresponde ao nome do arquivo da view, e esse arquivo de controller existe.",
  "controller-matches-view.nameMismatch":
    'A view "{viewFile}" deveria referenciar um controller chamado "{viewBaseName}", mas referencia "{controllerName}" (nome base esperado "{viewBaseName}", obtido "{controllerBaseName}").',
  "controller-matches-view.missingController":
    'A view "{viewFile}" referencia o controller "{controllerName}", para o qual não existe o arquivo "{expectedBaseName}.controller.ts".',

  "folder-structure.description": "A estrutura mínima de pastas está presente.",
  "folder-structure.missingFolder": "Pasta obrigatória ausente: {folderPath}",
  "folder-structure.viewWrongPath": "A view não está em {viewPath}: {file}",
  "folder-structure.controllerWrongPath": "O controller não está em {controllerPath}: {file}",

  "no-custom-controls.description": "O projeto não define controles UI5 próprios.",
  "no-custom-controls.customControl": 'Controle próprio "{name}" em {file}',

  "odata-service.description": "O número de serviços OData utilizados está dentro do intervalo esperado.",
  "odata-service.belowMin": "Apenas {count} serviço(s) OData encontrado(s), esperado no mínimo {min}.",
  "odata-service.aboveMax": "{count} serviço(s) OData encontrado(s), permitido no máximo {max}.",

  "odata-metadata-local.description": "O documento de metadados OData está disponível localmente.",
  "odata-metadata-local.missingLocalUri": 'A dataSource OData "{name}" não tem settings.localUri.',
  "odata-metadata-local.missingFile": "Arquivo de metadados local ausente: {filePath}",
  "odata-metadata-local.wrongPath": "O arquivo de metadados não está em {basePath}: {filePath}",

  "odata-mockdata.description": "Há dados fictícios (mock) para o serviço OData.",
  "odata-mockdata.noneAny": "Nenhum arquivo de dados fictícios em {dataPath}.",
  "odata-mockdata.missingAllEntities": "Faltam dados fictícios para os EntitySets: {entities}",
  "odata-mockdata.noneOneEntity": "Nenhum dado fictício para ao menos um EntitySet em {dataPath}.",

  "non-odata-json.description": "Serviços não-OData são implementados como JSONModel.",
  "non-odata-json.wrongType": 'A dataSource não-OData "{name}" tem type "{type}" em vez de "JSON".',
  "non-odata-json.wrongModel": 'O model da dataSource "{name}" não é um JSONModel.',

  "no-custom-css.description": "O projeto não contém CSS próprio.",
  "no-custom-css.cssFile": "Arquivo CSS próprio: {file}",
  "no-custom-css.resourcesNotEmpty": "sap.ui5/resources/css no manifest não está vazio.",

  "theme.description": "O tema é definido e configurado de forma consistente.",
  "theme.conflict": 'O tema em index.html ("{htmlTheme}") e em ui5.yaml ("{yamlTheme}") são contraditórios.',
  "theme.notDetected": "Não foi possível determinar um tema (nem index.html nem ui5.yaml).",
  "theme.notAllowed": 'O tema "{theme}" não é permitido (permitidos: {allowed}).',

  "cache-buster.description": "O app utiliza o cache buster.",
  "cache-buster.missing":
    "Nenhuma task/middleware de cache buster configurada em ui5.yaml, e o index.html não carrega o UI5 via uma URL de cache buster versionada.",

  "namespace.description": "O app usa o namespace definido.",
  "namespace.wrongPrefix": '{label} ("{id}") não começa com "{expected}".',

  "consistent-namespace.description": "Todos os artefatos do app usam o mesmo namespace.",
  "consistent-namespace.rootView":
    'sap.ui5/rootView/viewName ("{rootViewName}") não usa o namespace "{baseNamespace}".',
  "consistent-namespace.controllerName":
    'controllerName "{controllerName}" em {file} não usa o namespace "{baseNamespace}".',

  "fragments-folder.description": "Fragmentos XML que não são diálogos estão na pasta de fragments.",
  "fragments-folder.wrongPath": "O fragmento não está em {basePath}: {file}",

  "dialogs-folder.description": "Fragmentos com um diálogo como elemento raiz estão na pasta de dialogs.",
  "dialogs-folder.wrongPath": "O fragmento de diálogo não está em {basePath}: {file}",

  "i18n-used.description": "O i18n é utilizado.",
  "i18n-used.noModel": "Nenhum model i18n (sap.ui.model.resource.ResourceModel) configurado no manifest.",
  "i18n-used.missingBaseFile": "Arquivo base ausente: {basePath}/{prefix}.properties",

  "i18n-languages.description": "O app suporta os idiomas definidos pela empresa.",
  "i18n-languages.missingSupportedLocale": '{source}: o idioma "{lang}" está faltando em supportedLocales.',
  "i18n-languages.missingFile": "Falta o arquivo {basePath}/{prefix}_{lang}.properties.",
  "i18n-languages.extraLanguage": '{source}: o idioma "{lang}" não faz parte do requisito (strict).',

  "i18n-fallback.description": "Um idioma padrão está definido.",
  "i18n-fallback.wrongFallback": '{source}: fallbackLocale é "{fallbackLocale}", esperado "{expected}".',
  "i18n-fallback.notInSupported": '{source}: fallbackLocale "{expected}" não está incluído em supportedLocales.',

  "device-types.description": "Os device types suportados estão definidos.",
  "device-types.wrongValue": "sap.ui/deviceTypes/{key} não é {expected}.",

  "flex-enabled.description": "flexEnabled tem o valor definido.",
  "flex-enabled.wrongValue": 'sap.ui5/flexEnabled é "{actual}", esperado "{expected}".',

  "content-densities.description": "As content densities têm os valores definidos.",
  "content-densities.wrongValue": "sap.ui5/contentDensities/{key} não é {expected}.",

  "mockserver-config.description": "Há uma configuração de mock server presente.",
  "mockserver-config.missing": "Falta o arquivo {fileName} na raiz do projeto.",

  "framework.description": "O framework utilizado é definido.",
  "framework.wrongValue": 'framework.name em ui5.yaml é "{actual}", esperado "{expected}".',

  "ui5-version.description": "A versão do UI5 atende ao requisito.",
  "ui5-version.notSet": "{label} não está definido.",
  "ui5-version.belowMin": '{label} ("{version}") é menor que a versão mínima "{min}".',
  "ui5-version.aboveMax": '{label} ("{version}") excede a versão máxima "{max}".',
  "ui5-version.inconsistent":
    'minUI5Version ("{manifestVersion}") e framework.version ("{yamlVersion}") não são consistentes (major.minor).',

  "flp-config.description": "O app tem uma configuração de Fiori Launchpad para pelo menos um tile.",
  "flp-config.missing": "sap.app/crossNavigation/inbounds não tem entrada com semanticObject e action.",

  "deploy-config.description": "Há uma configuração de deployment com backend configurado.",
  "deploy-config.missingFile": "Falta o arquivo {fileName} na raiz do projeto.",
  "deploy-config.noBackend": "{fileName} não contém nenhuma deploy task com configuration.target.destination ou .url.",

  "app-title-description.description": "O app tem um título e uma descrição com texto real.",
  "app-title-description.noI18nRef": '{label} não referencia i18n ("{{...}}").',
  "app-title-description.emptyValue": 'A chave i18n "{key}" para {label} está vazia ou ausente.',

  "qunit-opa-tests.description": "O projeto tem testes unitários ou de integração com QUnit ou OPA5.",
  "qunit-opa-tests.missing": "Nenhum teste QUnit ou OPA5 encontrado em {basePath}.",

  "wdi5-tests.description": "O projeto usa wdio-ui5 (wdi5) para testes end-to-end.",
  "wdi5-tests.missingConfig": "Falta o arquivo {configFile} (ou .ts) na raiz do projeto.",
  "wdi5-tests.missingDependency": "wdio-ui5-service não é uma dependência em package.json.",

  "playwright-tests.description": "O projeto usa Playwright para testes end-to-end.",
  "playwright-tests.missingConfig": "Falta o arquivo {configFile} (ou .js) na raiz do projeto.",
  "playwright-tests.missingDependency": "@playwright/test não é uma dependência em package.json.",

  "app-icons.description": "O app tem ícones próprios em vez dos placeholders do gerador.",
  "app-icons.notSet": "sap.ui/icons/{field} não está definido.",

  "app-version.description": "A versão do app foi mantida e não é o padrão do gerador.",
  "app-version.stillDefault": '{label} ainda é o padrão "{defaultValue}".',
};

export default ptBR;
