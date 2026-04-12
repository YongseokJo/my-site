export interface ResearchProject {
  id: string;
  title: string;
  brief: string;
  description: string;
  status: "Active" | "Completed";
  icon: string;
  relatedPublications: { title: string; year: number; url: string }[];
}

export const researchProjects: ResearchProject[] = [
  {
    id: "star-clusters",
    title: "First Star Clusters & Black Holes",
    brief:
      "Modeling the formation of the first star clusters and massive black holes in the early universe using self-consistent hybrid hydro/N-body cosmological simulations.",
    description:
      "This research program uses state-of-the-art cosmological simulations to understand how the first star clusters and black holes formed in the early universe. By developing self-consistent hybrid hydro/N-body methods, we can track the co-evolution of star clusters within their host galaxies across cosmic time. This work bridges the gap between small-scale star formation physics and large-scale cosmological structure formation, providing insights into the seeds of today's galaxy populations.",
    status: "Active",
    icon: "Sparkles",
    relatedPublications: [
      {
        title:
          "Evolution of Star Clusters within Galaxies Using Self-consistent Hybrid Hydro/N-body Simulations",
        year: 2024,
        url: "https://arxiv.org/abs/2408.03128",
      },
      {
        title:
          "High-redshift Galaxy Formation with Self-consistently Modeled Stars and Massive Black Holes",
        year: 2019,
        url: "https://arxiv.org/abs/1910.12888",
      },
    ],
  },
  {
    id: "ml-cosmology",
    title: "Machine Learning for Cosmological Simulations",
    brief:
      "Applying machine learning techniques to calibrate cosmological simulation parameters and estimate galactic baryonic properties across multiple simulation models.",
    description:
      "This research leverages machine learning to tackle fundamental challenges in computational cosmology. We develop methods to calibrate simulation parameters using implicit likelihood inference, test the robustness of ML models across different cosmological simulation suites (IllustrisTNG, SIMBA, ASTRID, SWIFT-EAGLE), and pioneer techniques for estimating galactic baryonic properties from dark matter halos. This work is conducted within the CAMELS collaboration, advancing our ability to constrain cosmological models with observational data.",
    status: "Active",
    icon: "Brain",
    relatedPublications: [
      {
        title: "Toward Robustness across Cosmological Simulation Models",
        year: 2025,
        url: "https://arxiv.org/abs/2502.13239",
      },
      {
        title:
          "Calibrating Cosmological Simulations with Implicit Likelihood Inference",
        year: 2023,
        url: "https://arxiv.org/abs/2211.16461",
      },
      {
        title: "Machine-assisted semi-simulation model (MSSM)",
        year: 2019,
        url: "https://arxiv.org/abs/1908.09844",
      },
    ],
  },
  {
    id: "galaxy-statistics",
    title: "Statistical Methods for Galaxy Observables",
    brief:
      "Developing statistical frameworks to constrain theoretical models from galaxy observables, with focus on covariance analysis and domain generalization.",
    description:
      "This line of research develops rigorous statistical methods for comparing cosmological simulations with observed galaxy populations. We investigate the significance of covariance structures in constraining theoretical models and develop domain-generalized neural networks that can transfer knowledge from simulations to real survey data like SDSS. These methods are essential for extracting maximum scientific insight from both current and upcoming galaxy surveys.",
    status: "Active",
    icon: "BarChart3",
    relatedPublications: [
      {
        title:
          "On the Significance of Covariance for Constraining Theoretical Models From Galaxy Observables",
        year: 2024,
        url: "https://arxiv.org/abs/2410.21722",
      },
      {
        title:
          "Inferring Cosmological Parameters on SDSS via Domain-generalized Neural Networks",
        year: 2024,
        url: "https://arxiv.org/abs/2409.02256",
      },
    ],
  },
];
