import { System } from './system';

import { Camera } from '@babylonjs/core/Cameras/camera';
// To Enable DepthRendering
import '@babylonjs/core/Rendering/depthRendererSceneComponent';
import { DefaultRenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline';
import { ImageProcessingConfiguration } from '@babylonjs/core/Materials/imageProcessingConfiguration';
import { ColorCurves } from '@babylonjs/core/Materials/colorCurves';
import { Color4 } from '@babylonjs/core/Maths/math';
import { EasingFunction, CircleEase } from '@babylonjs/core/Animations/easing';
import { DepthOfFieldEffectBlurLevel } from '@babylonjs/core/PostProcesses/depthOfFieldEffect';
import clone from 'lodash/clone';
import { EventsName } from '@naker/services/Tools/observable';

export interface pipelineOptions {
    fieldOfView?: number,
    vignette?: Array<number>,
    vignetteOffset?: number,
    focalLength?: number,
    focalDistance?: number,
    bloom?: number,
    contrast?: number,
    exposure?: number,
    sharpenEdge?: number,
    sharpenColor?: number,
    chromatic?: number,
    colorDensity?: number,
    colorExposure?: number,
    colorSaturation?: number,
    colorHue?: number,
}

export let defaultPipelineValues: pipelineOptions = {
    fieldOfView: 0.8,
    vignette: [0, 0, 0, 0],
    vignetteOffset: 0,
    focalLength: 0,
    focalDistance: 1,
    bloom: 0,
    contrast: 1,
    exposure: 1,
    sharpenEdge: 0,
    sharpenColor: 1,
    chromatic: 0,
    colorDensity: 0,
    colorExposure: 0,
    colorSaturation: 0,
    colorHue: 30,
};

/**
* Manager of all story postprocesses, the pipeline will not impact UI (Progress bar, captions, etc)
*/
export class Pipeline {

    /**
    * @ignore
    */
    _system: System;

    /**
    * @ignore
    */
    defaultPipeline: DefaultRenderingPipeline;

    /**
    * Save current pipeline options
    */
    defaultValues: pipelineOptions = defaultPipelineValues;

    /**
     * @ignore
     */
    pipelineEase: EasingFunction;

    /**
    * @param system System of the 3D scene
    * @param responsive Responsive to manage vignette depending on screen ratio
    */
    constructor(system: System) {
        this._system = system;
        this.cameras = [ system.camera ];
        this.pipelineEase = new CircleEase();

        this.initPipeline();
        this.setEvents();
    }

    initPipeline() {
        this.defaultPipeline = new DefaultRenderingPipeline("default_pipeline", true, this._system.scene, [this._system.camera]);
        // Keep fxaa to keep a global good scene quality
        this.defaultPipeline.fxaaEnabled = true;

        // this.defaultPipeline.depthOfFieldBlurLevel = DepthOfFieldEffectBlurLevel.Medium;
        this.defaultPipeline.depthOfField.fStop = 3;
        console.log(this.defaultPipeline.depthOfField);
        
        this.defaultPipeline.depthOfField.focalLength = 500;

        this.defaultPipeline.bloomKernel = 20;
        this.defaultPipeline.bloomWeight = 0;
        this.defaultPipeline.bloomThreshold = 0.5;

        this.useSceneImageProcessing();
    }

    // Can't manage to make it work properly
    // Plus I am not sure it will enabled to have imageProcessing on only one camera
    // usePipelineImageProcessing() {
    //     this._system.scene.imageProcessingConfiguration.isEnabled = false;
    //     this.defaultPipeline.imageProcessingEnabled = true;
    //     this.defaultPipeline.imageProcessing.imageProcessingConfiguration = new ImageProcessingConfiguration();
    //     this.defaultPipeline.imageProcessing.imageProcessingConfiguration.applyByPostProcess = true;
    // }

    useSceneImageProcessing() {
        this.defaultPipeline.imageProcessingEnabled = false;
        this._system.scene.imageProcessingConfiguration.isEnabled = true;
        this.setImageProcessingConfiguration(this._system.scene.imageProcessingConfiguration);
    }
    
    setImageProcessingConfiguration(imageProcessingConfiguration: ImageProcessingConfiguration) {
        this.imageProcessingConfiguration = imageProcessingConfiguration;
        imageProcessingConfiguration.isEnabled = true;
        imageProcessingConfiguration.applyByPostProcess = false;
    }

    setEvents() {
        this._system.on(EventsName.Resize, () => {
            this.checkDepthOfFieldKernel();
        }, null, true);

        this._system.on(EventsName.Start, () => {
            this.defaultPipeline.samples = 1;
            this.defaultPipeline.depthOfFieldBlurLevel = DepthOfFieldEffectBlurLevel.Low;
            this._setDepthOfFieldKernel(this.kernel);
        }, null, true);

        this._system.on(EventsName.Stop, () => {
            this.defaultPipeline.samples = 4;
            this.defaultPipeline.depthOfFieldBlurLevel = DepthOfFieldEffectBlurLevel.Medium;
            this._setDepthOfFieldKernel(this.kernel/4);
        }, null, true);
    }

    /**
    * Start pipeline with default values
    */
    imageProcessingConfiguration: ImageProcessingConfiguration;
    started = false;
    start() {
        this.started = true;
        this.imageProcessingConfiguration.isEnabled = true;
        this.imageProcessingConfiguration.colorCurvesEnabled = true;
        this.imageProcessingConfiguration.colorCurves = new ColorCurves();
        this.imageProcessingConfiguration.vignetteEnabled = false;
    }

    /**
    * Set all the pipeline options
    * @param pipelineOptions The options to be set
    */
    setOption(pipelineOptions: pipelineOptions) {
        this.setFieldOfView(pipelineOptions.fieldOfView);
        this.setVignette(pipelineOptions.vignette);
        // this.setVignetteOffset(pipelineOptions.vignetteOffset);
        this.setFocalLength(pipelineOptions.focalLength);
        this.setFocalDistance(pipelineOptions.focalDistance);
        this.setBloom(pipelineOptions.bloom);
        this.setContrast(pipelineOptions.contrast);
        this.setExposure(pipelineOptions.exposure);
        this.setSharpenEdge(pipelineOptions.sharpenEdge);
        this.setSharpenColor(pipelineOptions.sharpenColor);
        this.setChromatic(pipelineOptions.chromatic);
        this.setColorDensity(pipelineOptions.colorDensity);
        this.setColorSaturation(pipelineOptions.colorSaturation);
        this.setColorExposure(pipelineOptions.colorExposure);
        this.setColorHue(pipelineOptions.colorHue);
    }

    /**
    * Set only some pipeline options
    * @param pipelineOptions The options to be set
    */
    checkOption(pipelineOptions: pipelineOptions) {
        if (pipelineOptions.fieldOfView !== undefined) this.setFieldOfView(pipelineOptions.fieldOfView);
        if (pipelineOptions.vignette !== undefined) this.setVignette(pipelineOptions.vignette);
        // if (pipelineOptions.vignetteOffset !== undefined) this.setVignetteOffset(pipelineOptions.vignetteOffset);
        if (pipelineOptions.focalLength !== undefined) this.setFocalLength(pipelineOptions.focalLength);
        if (pipelineOptions.focalDistance !== undefined) this.setFocalDistance(pipelineOptions.focalDistance);
        if (pipelineOptions.bloom !== undefined) this.setBloom(pipelineOptions.bloom);
        if (pipelineOptions.contrast !== undefined) this.setContrast(pipelineOptions.contrast);
        if (pipelineOptions.exposure !== undefined) this.setExposure(pipelineOptions.exposure);
        if (pipelineOptions.sharpenEdge !== undefined) this.setSharpenEdge(pipelineOptions.sharpenEdge);
        if (pipelineOptions.sharpenColor !== undefined) this.setSharpenColor(pipelineOptions.sharpenColor);
        if (pipelineOptions.chromatic !== undefined) this.setChromatic(pipelineOptions.chromatic);
        if (pipelineOptions.colorDensity !== undefined) this.setColorDensity(pipelineOptions.colorDensity);
        if (pipelineOptions.colorSaturation !== undefined) this.setColorSaturation(pipelineOptions.colorSaturation);
        if (pipelineOptions.colorExposure !== undefined) this.setColorExposure(pipelineOptions.colorExposure);
        if (pipelineOptions.colorHue !== undefined) this.setColorHue(pipelineOptions.colorHue);
    }

    _setOptionWithoutSave(pipelineOptions: pipelineOptions) {
        this._checkOptionWithoutSave(this.defaultValues);
        this._checkOptionWithoutSave(pipelineOptions);
    }

    _checkOptionWithoutSave(pipelineOptions: pipelineOptions) {
        if (pipelineOptions.fieldOfView !== undefined) this._setFieldOfView(pipelineOptions.fieldOfView);
        if (pipelineOptions.vignette !== undefined) this._setVignette(pipelineOptions.vignette);
        // if (pipelineOptions.vignetteOffset !== undefined) this._setVignetteOffset(pipelineOptions.vignetteOffset);
        if (pipelineOptions.focalLength !== undefined) this._setFocalLength(pipelineOptions.focalLength);
        if (pipelineOptions.focalDistance !== undefined) this._setFocalDistance(pipelineOptions.focalDistance);
        if (pipelineOptions.bloom !== undefined) this._setBloom(pipelineOptions.bloom);
        if (pipelineOptions.contrast !== undefined) this._setContrast(pipelineOptions.contrast);
        if (pipelineOptions.exposure !== undefined) this._setExposure(pipelineOptions.exposure);
        if (pipelineOptions.sharpenEdge !== undefined) this._setSharpenEdge(pipelineOptions.sharpenEdge);
        if (pipelineOptions.sharpenColor !== undefined) this._setSharpenColor(pipelineOptions.sharpenColor);
        if (pipelineOptions.chromatic !== undefined) this._setChromatic(pipelineOptions.chromatic);
        if (pipelineOptions.colorDensity !== undefined) this._setColorDensity(pipelineOptions.colorDensity);
        if (pipelineOptions.colorSaturation !== undefined) this._setColorSaturation(pipelineOptions.colorSaturation);
        if (pipelineOptions.colorExposure !== undefined) this._setColorExposure(pipelineOptions.colorExposure);
        if (pipelineOptions.colorHue !== undefined) this._setColorHue(pipelineOptions.colorHue);
    }

    reset() {
        this._checkOptionWithoutSave(this.defaultValues);
    }

    /**
    * Set the field of view
    * @param fieldOfView of the scene camera
    */
    setFieldOfView(fieldOfView: number) {
        this.defaultValues.fieldOfView = fieldOfView;
        this._setFieldOfView(fieldOfView);
    }

    _setFieldOfView(fieldOfView: number) {
        for (let i = 0; i < this.cameras.length; i++) {
            this.cameras[i].fov = fieldOfView;
            // Gui Camera also need the good field of view for pick events and position
            if (this._system.guiCamera) this._system.guiCamera.fov = fieldOfView;
        }
    }

    // Adapt blur kernel so that it stays constant whatever the support
    kernel = 20;
    checkDepthOfFieldKernel() {
        let newKernel = (this._system.renderWidth + this._system.renderHeight) / 100;
        this.setDepthOfFieldKernel(newKernel);
    }

    setDepthOfFieldKernel(kernel: number) {
        this.kernel = kernel;
        this._setDepthOfFieldKernel(kernel);
    }

    _setDepthOfFieldKernel(kernel: number) {
        let yDepthOfField = this.defaultPipeline.depthOfField._depthOfFieldBlurY;
        for (let i = 0; i < yDepthOfField.length; i++) {
            yDepthOfField[i].kernel = kernel;
        }
        let xDepthOfField = this.defaultPipeline.depthOfField._depthOfFieldBlurX;
        for (let i = 0; i < yDepthOfField.length; i++) {
            xDepthOfField[i].kernel = kernel;
        }
    }

    /**
    * Set the bloom postprocess
    * @param bloom Bloom of the scene
    */
    setBloom(bloom: number) {
        this.defaultValues.bloom = bloom;
        this._setBloom(bloom);
    }

    _setBloom(bloom: number) {
        if (bloom != defaultPipelineValues.bloom) {
            this.defaultPipeline.bloomEnabled = true;
            this.defaultPipeline.bloomWeight = bloom;
        } else {
            this.defaultPipeline.bloomEnabled = false;
        }
    }

    /**
    * Set the contrast postprocess
    * @param contrast Contrast of the scene
    */
    setContrast(contrast: number) {
        this.defaultValues.contrast = contrast;
        this._setContrast(contrast);
    }

    _setContrast(contrast: number) {
        this.imageProcessingConfiguration.contrast = contrast;
    }

    /**
    * Set the exposure postprocess
    * @param exposure Exposure of the scene
    */
    setExposure(exposure: number) {
        this.defaultValues.exposure = exposure;
        this._setContrast(exposure);
    }

    _setExposure(exposure: number) {
        this.imageProcessingConfiguration.exposure = exposure;
    }

    /**
    * Set the sharpen color postprocess
    * @param sharpenColor SharpenColor of the scene
    */
    setSharpenColor(sharpenColor: number) {
        this.defaultValues.sharpenColor = sharpenColor;
        this._setSharpenColor(sharpenColor);
    }

    _setSharpenColor(sharpenColor: number) {
        this.defaultPipeline.sharpen.colorAmount = sharpenColor;
        this.checkSharpen();
    }

    /**
    * Set the sharpen edge postprocess
    * @param sharpenEdge SharpenEdge of the scene
    */
    setSharpenEdge(sharpenEdge: number) {
        this.defaultValues.sharpenEdge = sharpenEdge;
        this._setSharpenEdge(sharpenEdge);
    }

    _setSharpenEdge(sharpenEdge: number) {
        this.defaultPipeline.sharpen.edgeAmount = sharpenEdge;
        this.checkSharpen();
    }

    /**
    * Check if sharpen post process must be enabled depending on sharpen options
    */
    checkSharpen() {
        if (this.defaultValues.sharpenEdge == defaultPipelineValues.sharpenEdge && this.defaultValues.sharpenColor == defaultPipelineValues.sharpenColor) this.defaultPipeline.sharpenEnabled = false;
        else this.defaultPipeline.sharpenEnabled = true;
    }

    /**
    * Set the chromatic postprocess
    * @param chromatic Chromatic of the scene
    */
    setChromatic(chromatic: number) {
        this.defaultValues.chromatic = chromatic;
        this._setChromatic(chromatic);
    }

    _setChromatic(chromatic: number) {
        if (chromatic) {
            this.defaultPipeline.chromaticAberrationEnabled = true;
            this.defaultPipeline.chromaticAberration.aberrationAmount = chromatic;
        } else {
            this.defaultPipeline.chromaticAberrationEnabled = false;
        }
    }

    /**
    * Set the focal length of the depth of field postprocess
    * @param focalLength Focal length of the effect
    */
    setFocalLength(focalLength: number) {
        this.defaultValues.focalLength = focalLength;
        this._setFocalLength(focalLength);
    }

    _setFocalLength(focalLength: number) {
        if (focalLength) {
            this.defaultPipeline.depthOfFieldEnabled = true;
            this.defaultPipeline.depthOfField.focalLength = focalLength;
        } else {
            this.defaultPipeline.depthOfFieldEnabled = false;
        }
    }

    /**
    * Set the focal distance of the depth of field postprocess
    * @param focalDistance Focal distance in meters
    */
    setFocalDistance(focalDistance: number) {
        this.defaultValues.focalDistance = focalDistance;
        this._setFocalDistance(focalDistance);
    }

    _setFocalDistance(focalDistance: number) {
        if (this.defaultPipeline.depthOfFieldEnabled) {
            // focusDistance set in millimeters
            this.defaultPipeline.depthOfField.focusDistance = focalDistance * 1000;
        }
    }

    /**
    * Set the vignette postprocess
    * @param color Color of the vignette
    */
    setVignette(color: Array<number>) {
        if (color) this.defaultValues.vignette = color;
        else this.defaultValues.vignette = clone(defaultPipelineValues.vignette);
        this._setVignette(color);
    }

    _setVignette(color: Array<number>) {
        if (color) {
            this.imageProcessingConfiguration.vignetteEnabled = true;
            this.imageProcessingConfiguration.vignetteColor = Color4.FromInts(color[0], color[1], color[2], 1);
            this.imageProcessingConfiguration.vignetteBlendMode = ImageProcessingConfiguration.VIGNETTEMODE_OPAQUE;
            this.setVignetteWeight(color[3]);
        } else {
            this.imageProcessingConfiguration.vignetteEnabled = false;
            this.imageProcessingConfiguration.vignetteWeight = 0;
        }
    }

    /**
    * @ignore
    */
    vignetteWeightRatio = 40;

    /**
    * @ignore
    */
    vignetteWeight: number;

    /**
    * Set the weight of the vignette
    * @param weight How strong is the weight of vignette
    */
    setVignetteWeight(weight: number) {
        this.vignetteWeight = weight;
        if (weight !== undefined) this.imageProcessingConfiguration.vignetteWeight = weight * this.vignetteWeightRatio;
    }

    /**
    * Allow to offset the vignette center
    * @param offset How much the vignette must be offseted
    */
    setVignetteOffset(offset: number) {
        this.defaultValues.vignetteOffset = offset;
        this.checkVignetteWigthRatio(this._system.containerRatio);
        let ratio = Math.max(Math.min(this._system.containerRatio, offset), -offset);
        if (ratio >= 0) {
            this.imageProcessingConfiguration.vignetteCentreX = ratio / 1.2;
            this.imageProcessingConfiguration.vignetteCentreY = 0;
        } else {
            this.imageProcessingConfiguration.vignetteCentreX = 0;
            this.imageProcessingConfiguration.vignetteCentreY = -ratio / 1.5;
        }
    }

    /**
    * Limit vignette ratio in order to have correct effect
    */
    maxVignetteRatio = 0.6;

    /**
    * Check vignette ratio depending on screen ratio
    */
    checkVignetteWigthRatio(ratio: number) {
        if (ratio > 0) {
            this.vignetteWeightRatio = 40;
            if (this.vignetteWeight) this.setVignetteWeight(this.vignetteWeight);
        } else {
            this.vignetteWeightRatio = 80;
            if (this.vignetteWeight) this.setVignetteWeight(this.vignetteWeight);
        }
    }

    setColorDensity(density: number) {
        this.defaultValues.colorDensity = density;
        this._setColorDensity(density);
    }

    _setColorDensity(density: number) {
        this.imageProcessingConfiguration.colorCurves.globalDensity = density;
    }

    setColorSaturation(saturation: number) {
        this.defaultValues.colorSaturation = saturation;
        this._setColorSaturation(saturation);
    }

    _setColorSaturation(saturation: number) {
        this.imageProcessingConfiguration.colorCurves.globalSaturation = saturation;
    }

    setColorExposure(exposure: number) {
        this.defaultValues.colorExposure = exposure;
        this._setColorExposure(exposure);
    }

    _setColorExposure(exposure: number) {
        this.imageProcessingConfiguration.colorCurves.globalExposure = exposure;
    }

    setColorHue(hue: number) {
        this.defaultValues.colorHue = hue;
        this._setColorHue(hue);
    }

    _setColorHue(hue: number) {
        this.imageProcessingConfiguration.colorCurves.globalHue = hue;
    }

    /**
    * List of the cameras used by pipeline
    */
    cameras: Array<Camera> = [];

    /**
    * @param camera Camera to be added in pipeline
    */
    addCamera(camera: Camera) {
        let index = this.cameras.indexOf(camera);
        if (index == -1) {
            this.defaultPipeline.addCamera(camera);
            this.cameras.push(camera);
        }
        this.checkOption(this.defaultValues);
    }

    /**
    * @param camera Camera to be removed in pipeline
    */
    removeCamera(camera: Camera) {
        let index = this.cameras.indexOf(camera);
        if (index != -1) {
            this.defaultPipeline.removeCamera(camera);
            this.cameras.splice(index, 1);
        }
    }

}
