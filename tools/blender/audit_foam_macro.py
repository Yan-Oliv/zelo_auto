"""Audit morph displacement statistics for an offline FoamMacro GLB.

Run:
  blender --background --python tools/blender/audit_foam_macro.py -- \
    --asset public/models/lincoln_foam_macro.glb \
    --car public/models/lincoln.glb
"""

import argparse
import math
import statistics
import sys

import bpy
from mathutils import Vector


def arguments():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--asset", required=True)
    parser.add_argument("--car", required=True)
    return parser.parse_args(argv)


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)


def world_bounds(objects):
    points = []
    for obj in objects:
        if obj.type != "MESH":
            continue
        for vertex in obj.data.vertices:
            points.append(obj.matrix_world @ vertex.co)
    minimum = Vector((min(point.x for point in points), min(point.y for point in points), min(point.z for point in points)))
    maximum = Vector((max(point.x for point in points), max(point.y for point in points), max(point.z for point in points)))
    return minimum, maximum


def percentile(values, fraction):
    if not values:
        return 0.0
    values = sorted(values)
    offset = (len(values) - 1) * fraction
    low = math.floor(offset)
    high = math.ceil(offset)
    return values[low] if low == high else values[low] + (values[high] - values[low]) * (offset - low)


def main():
    args = arguments()
    clear_scene()
    bpy.ops.import_scene.gltf(filepath=args.car)
    car_min, car_max = world_bounds(list(bpy.context.scene.objects))
    vehicle_diagonal = (car_max - car_min).length
    bpy.ops.import_scene.gltf(filepath=args.asset)
    macro = bpy.data.objects.get("FoamMacroMesh")
    if macro is None or macro.type != "MESH":
        raise RuntimeError("FoamMacroMesh not found in asset")
    keys = macro.data.shape_keys
    if keys is None:
        raise RuntimeError("Asset has no shape keys")
    basis = keys.key_blocks.get("Basis")
    if basis is None:
        raise RuntimeError("Basis shape key missing")
    epsilon = vehicle_diagonal * 0.00001
    print("FOAM_MACRO_ASSET_AUDIT asset=%s vehicle_diagonal=%.9f epsilon=%.9f" % (args.asset, vehicle_diagonal, epsilon))
    for name in ("FoamThin", "FoamFull", "FoamDrained"):
        target = keys.key_blocks.get(name)
        if target is None:
            raise RuntimeError("Missing shape key %s" % name)
        distances = [(target.data[index].co - basis.data[index].co).length for index in range(len(basis.data))]
        affected = sum(value > epsilon for value in distances)
        print(
            "FOAM_MACRO_ASSET_MORPH name=%s min=%.9f mean=%.9f median=%.9f p90=%.9f p95=%.9f max=%.9f affected=%d affected_pct=%.3f mean_diag_pct=%.6f median_diag_pct=%.6f p95_diag_pct=%.6f max_diag_pct=%.6f"
            % (
                name,
                min(distances),
                statistics.fmean(distances),
                statistics.median(distances),
                percentile(distances, 0.90),
                percentile(distances, 0.95),
                max(distances),
                affected,
                affected * 100.0 / len(distances),
                statistics.fmean(distances) * 100.0 / vehicle_diagonal,
                statistics.median(distances) * 100.0 / vehicle_diagonal,
                percentile(distances, 0.95) * 100.0 / vehicle_diagonal,
                max(distances) * 100.0 / vehicle_diagonal,
            )
        )


if __name__ == "__main__":
    main()
