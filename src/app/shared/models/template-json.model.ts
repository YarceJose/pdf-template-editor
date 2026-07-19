// ============================================
// TEMPLATE JSON MODELS — Single Source of Truth
// Espeja exactamente la estructura de templateJSON.json
// ============================================

// ============================================
// ROOT
// ============================================
export interface TemplateDocument {
  schemaVersion: number;
  templateId: string;
  name: string;
  version: number;
  status: 'Draft' | 'Published' | 'Archived';
  companyId: string;
  documentType: string;
  culture: string;
  unit: 'pt' | 'mm' | 'px';
  dataSource: DataSource;
  page: PageConfig;
  assets: Asset[];
  styles: StylesConfig;
  sections: Section[];
}

// ============================================
// DATA SOURCE
// ============================================
export interface DataSource {
  format: string;
  root: string;
  collections: Record<string, DataSourceCollection>;
}

export interface DataSourceCollection {
  path: string;
  key: string;
}

// ============================================
// PAGE
// ============================================
export interface PageConfig {
  size: string;
  width: number;
  height: number;
  orientation: 'Portrait' | 'Landscape';
  margins: PageMargins;
}

export interface PageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// ============================================
// ASSETS
// ============================================
export interface Asset {
  id: string;
  type: string;
  objectKey: string;
}

// ============================================
// STYLES
// ============================================
export interface StylesConfig {
  fonts: FontDefinition[];
}

export interface FontDefinition {
  id: string;
  family: string;
  size: number;
  bold: boolean;
  color: string;
}

// ============================================
// SECTIONS
// ============================================
export type SectionType = 'Header' | 'Customer' | 'Company' | 'Detail' | 'Taxes' | 'Totals' | 'Footer';
export type SectionLayout = 'Absolute' | 'Flow';
export type SectionContextType = 'Single' | 'Collection';

export interface Section {
  id: string;
  type: SectionType;
  layout: SectionLayout;
  contextType: SectionContextType;
  dataContext?: string;
  dataContexts?: Record<string, string>;
  bounds: Bounds;
  components: TemplateComponent[];
  relatedTo?: SectionRelation;
}

export interface SectionRelation {
  collection: string;
  key: string;
}

// ============================================
// BOUNDS / POSITION / SIZE
// ============================================
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// ============================================
// COMPONENTS — Union type
// ============================================
export type TemplateComponent =
  | TextComponent
  | ImageComponent
  | RectangleComponent
  | LineComponent
  | TableComponent;

export type ComponentType = 'Text' | 'Image' | 'Rectangle' | 'Line' | 'Table';

// Base fields shared by all components
export interface ComponentBase {
  id: string;
  type: ComponentType;
  position: Position;
  size: Size;
}

// ============================================
// TEXT COMPONENT
// ============================================
export type TextAlignment = 'Left' | 'Center' | 'Right' | 'Justify';

export interface TextComponent extends ComponentBase {
  type: 'Text';
  styleRef?: string;
  alignment?: TextAlignment;
  staticValue?: string;
  prefix?: string;
  suffix?: string;
  binding?: Binding;
  hideIfEmpty?: boolean;
}

// ============================================
// IMAGE COMPONENT
// ============================================
export type ImageFit = 'Contain' | 'Cover' | 'Fill' | 'None';

export interface ImageComponent extends ComponentBase {
  type: 'Image';
  assetId: string;
  fit?: ImageFit;
}

// ============================================
// RECTANGLE COMPONENT
// ============================================
export interface RectangleComponent extends ComponentBase {
  type: 'Rectangle';
  stroke?: string;
  strokeWidth?: number;
  fill?: string | null;
  cornerRadius?: number;
}

// ============================================
// LINE COMPONENT
// ============================================
export interface LinePosition {
  x: number;
  y: number;
}

export interface LineComponent extends ComponentBase {
  type: 'Line';
  start: LinePosition;
  end: LinePosition;
  stroke?: string;
  strokeWidth?: number;
}

// ============================================
// TABLE COMPONENT
// ============================================
export interface TableComponent extends ComponentBase {
  type: 'Table';
  headerStyleRef?: string;
  rowStyleRef?: string;
  headerBackground?: string;
  rowAltBackground?: string;
  borderColor?: string;
  borderWidth?: number;
  repeatHeaderOnNewPage?: boolean;
  rowHeight?: number;
  columns: TableColumn[];
}

export interface TableColumn {
  id: string;
  header: string;
  width: number;
  align: 'Left' | 'Center' | 'Right';
  binding?: Binding;
}

// ============================================
// BINDING
// ============================================
export type BindingDataType = 'String' | 'Decimal' | 'DateTime' | 'Integer';

export interface Binding {
  source: string;
  dataType: BindingDataType;
  format?: string;
  sourceCurrency?: string;
  hideIfEmpty?: boolean;
}

// ============================================
// UTILITY TYPES
// ============================================

/** Deep partial for patching */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/** Find component by ID in a template */
export function findComponentById(sections: Section[], componentId: string): { section: Section; component: TemplateComponent } | null {
  for (const section of sections) {
    const component = section.components.find((c) => c.id === componentId);
    if (component) return { section, component };
  }
  return null;
}

/** Get all components flattened from all sections */
export function getAllComponents(sections: Section[]): { sectionId: string; component: TemplateComponent }[] {
  return sections.flatMap((s) =>
    s.components.map((c) => ({ sectionId: s.id, component: c }))
  );
}

/** Resolve styleRef to FontDefinition */
export function resolveStyle(fonts: FontDefinition[], styleRef?: string): FontDefinition | undefined {
  if (!styleRef) return undefined;
  return fonts.find((f) => f.id === styleRef);
}
