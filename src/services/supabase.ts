import { supabase } from "@/integrations/supabase/client";

export interface InputImage {
  id: string;
  url: string;
  filename?: string;
  prompt?: string;
  created_at: string;
}

export interface GeneratedImage {
  id: string;
  input_id?: string;
  output_url?: string;
  model_name?: string;
  lora_used?: string;
  tags?: string[];
  steps?: number;
  seed?: number;
  guidance_scale?: number;
  denoise_strength?: number;
  created_at: string;
}

export interface LoraDataset {
  id: string;
  name?: string;
  description?: string;
  dataset_url?: string;
  image_count?: number;
  created_at: string;
}

export class OrauSupabaseService {
  // Input Images
  static async saveInputImage(data: {
    url: string;
    filename?: string;
    prompt?: string;
  }): Promise<InputImage | null> {
    const { data: result, error } = await supabase
      .from('input_images')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Error saving input image:', error);
      return null;
    }

    return result;
  }

  static async getInputImages(): Promise<InputImage[]> {
    const { data, error } = await supabase
      .from('input_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching input images:', error);
      return [];
    }

    return data || [];
  }

  // Generated Images
  static async saveGeneratedImage(data: {
    input_id?: string;
    output_url?: string;
    model_name?: string;
    lora_used?: string;
    tags?: string[];
    steps?: number;
    seed?: number;
    guidance_scale?: number;
    denoise_strength?: number;
  }): Promise<GeneratedImage | null> {
    const { data: result, error } = await supabase
      .from('generated_images')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Error saving generated image:', error);
      return null;
    }

    return result;
  }

  static async getGeneratedImages(): Promise<GeneratedImage[]> {
    const { data, error } = await supabase
      .from('generated_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching generated images:', error);
      return [];
    }

    return data || [];
  }

  static async getGeneratedImagesByInput(inputId: string): Promise<GeneratedImage[]> {
    const { data, error } = await supabase
      .from('generated_images')
      .select('*')
      .eq('input_id', inputId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching generated images by input:', error);
      return [];
    }

    return data || [];
  }

  // LoRA Datasets
  static async saveLoraDataset(data: {
    name?: string;
    description?: string;
    dataset_url?: string;
    image_count?: number;
  }): Promise<LoraDataset | null> {
    const { data: result, error } = await supabase
      .from('lora_datasets')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Error saving LoRA dataset:', error);
      return null;
    }

    return result;
  }

  static async getLoraDatasets(): Promise<LoraDataset[]> {
    const { data, error } = await supabase
      .from('lora_datasets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching LoRA datasets:', error);
      return [];
    }

    return data || [];
  }

  static async deleteLoraDataset(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('lora_datasets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting LoRA dataset:', error);
      return false;
    }

    return true;
  }
}