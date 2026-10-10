"use client";

import { useEffect, useState } from "react";
import type { BufferGeometry, Mesh } from "three";
import type { PlateauBuildingMeshes } from "@/lib/plateauBuildingGeometry";
import outlines from "@/data/station-building-outlines.json";
import summary from "@/data/plateau-buildings-summary.json";

let download: Promise<PlateauBuildingMeshes> | null = null;
function loadBuildings() {
  if (!download) download = import("three/examples/jsm/loaders/GLTFLoader.js").then(async ({GLTFLoader}) => {
    const base = process.env.NODE_ENV === "production" ? "/transit-layout" : "";
    const gltf = await new GLTFLoader().loadAsync(`${base}${summary.asset}`);
    const meshes = new Map<string,BufferGeometry>();
    gltf.scene.traverse(object => {
      const mesh = object as Mesh;
      if (!mesh.isMesh) return;
      const id = mesh.userData.explorerId;
      const expected = outlines.buildings.find(b=>b.explorerId===id);
      if (expected && mesh.userData.featureId === expected.featureId) {
        if (!mesh.geometry.getAttribute("normal")) mesh.geometry.computeVertexNormals();
        meshes.set(id,mesh.geometry);
      }
      for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) material.dispose();
    });
    if (meshes.size !== summary.buildings) {
      gltf.scene.traverse(object => (object as Mesh).geometry?.dispose());
      throw new Error("Building identities did not match the shared outlines");
    }
    return meshes as PlateauBuildingMeshes;
  }).catch(error => {download=null;throw error;});
  return download;
}

export function usePlateauBuildings(enabled: boolean) {
  const [meshes,setMeshes] = useState<PlateauBuildingMeshes | null>(null);
  const [error,setError] = useState(false);
  const [retryKey,setRetryKey] = useState(0);
  useEffect(()=>{
    if (!enabled || meshes) return;
    let cancelled=false;
    setError(false);
    loadBuildings().then(result=>{if(!cancelled) setMeshes(result);}).catch(()=>{if(!cancelled)setError(true);});
    return ()=>{cancelled=true;};
  },[enabled,meshes,retryKey]);
  return {meshes:enabled ? meshes : null, status: !enabled ? "off" : meshes ? "ready" : error ? "error" : "loading",
    retry:()=>setRetryKey(key=>key+1)};
}
