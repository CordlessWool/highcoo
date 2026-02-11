export enum WatermarkPosition {
	BottomRight = 'bottom-right',
	BottomLeft = 'bottom-left',
	TopRight = 'top-right',
	TopLeft = 'top-left',
	Center = 'center'
}

export const defaultSettings = {
	id: 1,
	watermarkFileHash: null,
	watermarkPosition: WatermarkPosition.BottomRight,
	watermarkOpacity: 0.5
};
