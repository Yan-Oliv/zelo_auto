import bpy
import os
from math import radians, sin, cos

ROOT = r"B:\OmnyaTech Project's\zelo_autoestica"
INPUT_FILE = os.path.join(ROOT, "src", "glb_car", "lincoln_continental_mark_v__www.vecarz.com.glb")
RAW_OUTPUT_FILE = os.path.join(ROOT, "public", "models", "lincoln-dirty-raw.glb")
PREVIEW_FILE = os.path.join(ROOT, "public", "models", "lincoln-dirty-preview.png")
MASK_FILE = os.path.join(ROOT, "public", "models", "lincoln-dust-mask.png")

DIRT = 0.92
DUST_COLOR = (0.34, 0.22, 0.13, 1.0)


def ensure_dir(path):
    directory = os.path.dirname(path)
    if directory and not os.path.exists(directory):
        os.makedirs(directory, exist_ok=True)


def clean_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)


def import_glb():
    bpy.ops.import_scene.gltf(filepath=INPUT_FILE)


def create_dust_mask_image():
    ensure_dir(MASK_FILE)
    width = 1024
    height = 1024
    image = bpy.data.images.new("DustMask", width=width, height=height, alpha=True)
    pixels = [0.0] * (width * height * 4)

    for y in range(height):
        ny = y / (height - 1)
        top_accum = (1.0 - ny) ** 0.45
        for x in range(width):
            nx = x / (width - 1)
            coarse = 0.5 + 0.5 * sin(nx * 14.0 + ny * 11.0)
            medium = abs(sin(nx * 45.0) * cos(ny * 33.0))
            fleck = abs(sin((nx + ny) * 210.0)) * 0.18
            edge = 0.12 * (0.5 + 0.5 * cos(nx * 6.0))
            value = max(0.0, min(1.0, 0.18 + top_accum * 0.74 + coarse * 0.12 + medium * 0.18 + fleck + edge))
            index = (y * width + x) * 4
            pixels[index + 0] = value
            pixels[index + 1] = value
            pixels[index + 2] = value
            pixels[index + 3] = value

    image.pixels = pixels
    image.filepath_raw = MASK_FILE
    image.file_format = "PNG"
    image.save()
    return image


def create_overlay_material(mask_image):
    mat = bpy.data.materials.new("DustOverlayMaterial")
    mat.use_nodes = True
    mat.blend_method = "BLEND"
    if hasattr(mat, "shadow_method"):
        mat.shadow_method = "HASHED"

    nt = mat.node_tree
    nodes = nt.nodes
    links = nt.links
    nodes.clear()

    output = nodes.new("ShaderNodeOutputMaterial")
    output.location = (380, 110)

    principled = nodes.new("ShaderNodeBsdfPrincipled")
    principled.location = (120, 110)
    principled.inputs["Base Color"].default_value = DUST_COLOR
    principled.inputs["Roughness"].default_value = 0.97
    principled.inputs["Alpha"].default_value = DIRT
    if principled.inputs.get("Coat Weight"):
        principled.inputs["Coat Weight"].default_value = 0.0
    if principled.inputs.get("Clearcoat"):
        principled.inputs["Clearcoat"].default_value = 0.0

    value = nodes.new("ShaderNodeValue")
    value.location = (-180, 10)
    value.outputs[0].default_value = DIRT

    links.new(value.outputs[0], principled.inputs["Alpha"])
    links.new(principled.outputs["BSDF"], output.inputs["Surface"])

    return mat


def apply_dust():
    mask_image = create_dust_mask_image()
    overlay_material = create_overlay_material(mask_image)

    original_meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    for obj in original_meshes:
        overlay = obj.copy()
        overlay.data = obj.data.copy()
        overlay.name = f"{obj.name}_dust"
        overlay.scale = (
            obj.scale[0] * 1.0015,
            obj.scale[1] * 1.0015,
            obj.scale[2] * 1.0015,
        )
        bpy.context.collection.objects.link(overlay)

        overlay.data.materials.clear()
        overlay.data.materials.append(overlay_material)


def setup_preview_render():
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = PREVIEW_FILE
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 1280
    scene.eevee.taa_render_samples = 64

    camera_data = bpy.data.cameras.new("PreviewCamera")
    camera = bpy.data.objects.new("PreviewCamera", camera_data)
    bpy.context.collection.objects.link(camera)
    camera.location = (8.7, -10.8, 4.5)
    camera.rotation_euler = (radians(74), 0, radians(36))
    camera.data.lens = 74
    scene.camera = camera

    key = bpy.data.lights.new(name="Key", type="AREA")
    key.energy = 7600
    key.color = (0.96, 0.88, 0.78)
    key.shape = "RECTANGLE"
    key.size = 7.0
    key_obj = bpy.data.objects.new(name="Key", object_data=key)
    bpy.context.collection.objects.link(key_obj)
    key_obj.location = (7.0, -7.0, 7.5)
    key_obj.rotation_euler = (radians(54), 0, radians(40))

    rim = bpy.data.lights.new(name="Rim", type="AREA")
    rim.energy = 5200
    rim.color = (0.78, 0.56, 0.30)
    rim.shape = "RECTANGLE"
    rim.size = 6.0
    rim_obj = bpy.data.objects.new(name="Rim", object_data=rim)
    bpy.context.collection.objects.link(rim_obj)
    rim_obj.location = (-7.0, 4.5, 5.5)
    rim_obj.rotation_euler = (radians(70), 0, radians(-110))

    world = scene.world
    world.use_nodes = True
    background = world.node_tree.nodes.get("Background")
    if background:
        background.inputs[0].default_value = (0.012, 0.010, 0.009, 1.0)
        background.inputs[1].default_value = 0.6


def export_glb():
    ensure_dir(RAW_OUTPUT_FILE)
    bpy.ops.export_scene.gltf(
        filepath=RAW_OUTPUT_FILE,
        export_format="GLB",
        export_image_format="AUTO",
    )


def render_preview():
    ensure_dir(PREVIEW_FILE)
    bpy.ops.render.render(write_still=True)


def main():
    clean_scene()
    import_glb()
    apply_dust()
    setup_preview_render()
    export_glb()
    render_preview()
    print(f"Dirty GLB exported to: {RAW_OUTPUT_FILE}")
    print(f"Preview rendered to: {PREVIEW_FILE}")


if __name__ == "__main__":
    main()
