import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export async function exporterExcel(donnees, colonnes, nomFichier, nomFeuille = "Données") {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(nomFeuille);

  // Colonnes
  ws.columns = colonnes.map(col => ({
    header: col.label,
    key:    col.cle,
    width:  col.largeur || 20,
  }));

  // Style en-tête
  ws.getRow(1).eachCell(cell => {
    cell.fill      = { type:"pattern", pattern:"solid", fgColor:{ argb:"FF1a3a5c" } };
    cell.font      = { bold:true, color:{ argb:"FFFFFFFF" }, size:11 };
    cell.alignment = { horizontal:"center", vertical:"middle" };
    cell.border    = {
      top:   { style:"thin" }, bottom:{ style:"thin" },
      left:  { style:"thin" }, right: { style:"thin" },
    };
  });
  ws.getRow(1).height = 25;

  // Données
  donnees.forEach((item, idx) => {
    const ligne = {};
    colonnes.forEach(col => { ligne[col.cle] = item[col.cle] ?? ""; });
    const row = ws.addRow(ligne);
    row.eachCell(cell => {
      cell.fill      = { type:"pattern", pattern:"solid", fgColor:{ argb: idx%2===0 ? "FFFFFFFF" : "FFF0F7FF" } };
      cell.border    = {
        top:   { style:"thin", color:{ argb:"FFe2e8f0" } },
        bottom:{ style:"thin", color:{ argb:"FFe2e8f0" } },
        left:  { style:"thin", color:{ argb:"FFe2e8f0" } },
        right: { style:"thin", color:{ argb:"FFe2e8f0" } },
      };
      cell.alignment = { vertical:"middle" };
    });
    row.height = 18;
  });

  // Télécharger
  const buffer = await wb.xlsx.writeBuffer();
  const blob   = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  const date = new Date().toLocaleDateString("fr-FR").replace(/\//g,"-");
  saveAs(blob, `${nomFichier}_${date}.xlsx`);
}

export const COLONNES_ETUDIANTS = [
  { cle:"matricule",           label:"Matricule",           largeur:22 },
  { cle:"nom",                 label:"Nom",                 largeur:15 },
  { cle:"prenom",              label:"Prénom",              largeur:15 },
  { cle:"sexe",                label:"Sexe",                largeur:8  },
  { cle:"code_specialite",     label:"Spécialité",          largeur:12 },
  { cle:"niveau",              label:"Niveau",              largeur:8  },
  { cle:"annee_academique",    label:"Année académique",    largeur:16 },
  { cle:"email_etudiant",      label:"Email étudiant",      largeur:28 },
  { cle:"telephone_etudiant",  label:"Téléphone étudiant",  largeur:16 },
  { cle:"nom_parent",          label:"Nom parent",          largeur:15 },
  { cle:"prenom_parent",       label:"Prénom parent",       largeur:15 },
  { cle:"lien_parent",         label:"Lien",                largeur:10 },
  { cle:"telephone_parent",    label:"Téléphone parent",    largeur:16 },
  { cle:"email_parent",        label:"Email parent",        largeur:28 },
];

export const COLONNES_PAIEMENTS = [
  { cle:"id_paiement",      label:"ID Paiement",        largeur:14 },
  { cle:"id_etudiant",      label:"ID Étudiant",        largeur:15 },
  { cle:"id_specialite",    label:"Spécialité",         largeur:12 },
  { cle:"niveau",           label:"Niveau",             largeur:8  },
  { cle:"numero_tranche",   label:"N° Tranche",         largeur:10 },
  { cle:"montant_attendu",  label:"Montant attendu",    largeur:16 },
  { cle:"montant_paye",     label:"Montant payé",       largeur:14 },
  { cle:"date_paiement",    label:"Date paiement",      largeur:14 },
  { cle:"date_limite",      label:"Date limite",        largeur:14 },
  { cle:"statut",           label:"Statut",             largeur:14 },
];

export const COLONNES_RETARDS = [
  { cle:"id_paiement",      label:"ID Paiement",        largeur:14 },
  { cle:"id_etudiant",      label:"ID Étudiant",        largeur:15 },
  { cle:"id_specialite",    label:"Spécialité",         largeur:12 },
  { cle:"numero_tranche",   label:"N° Tranche",         largeur:10 },
  { cle:"montant_attendu",  label:"Montant attendu",    largeur:16 },
  { cle:"montant_paye",     label:"Montant payé",       largeur:14 },
  { cle:"date_limite",      label:"Date limite",        largeur:14 },
  { cle:"statut",           label:"Statut",             largeur:14 },
];

export const COLONNES_SPECIALITES = [
  { cle:"code",             label:"Code",               largeur:10 },
  { cle:"nom_specialite",   label:"Nom spécialité",     largeur:28 },
  { cle:"departement",      label:"Département",        largeur:16 },
  { cle:"niveau",           label:"Niveau",             largeur:8  },
  { cle:"annee_academique", label:"Année académique",   largeur:16 },
  { cle:"tranche_1",        label:"Tranche 1 (FCFA)",   largeur:16 },
  { cle:"tranche_2",        label:"Tranche 2 (FCFA)",   largeur:16 },
  { cle:"tranche_3",        label:"Tranche 3 (FCFA)",   largeur:16 },
  { cle:"total",            label:"Total (FCFA)",        largeur:14 },
];